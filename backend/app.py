from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.responses import JSONResponse
from pyrogram import Client
import os
import asyncio
import logging
import uuid
import json
from typing import Dict, Any, Optional

import aiohttp
from pyrogram import Client, filters, types
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

app = FastAPI()


logger = logging.getLogger(__name__)

STATE_FILE = 'trigger_state.json'


class AuthRequest(BaseModel):
    api_id: int
    api_hash: str
    phone_number: Optional[str] = None
    bot_token: Optional[str] = None


class TriggerAddRequest(BaseModel):
    triggerType: str
    webhookUrl: Optional[str] = None
    api_id: Optional[int] = None
    api_hash: Optional[str] = None
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    updateHandlers: Optional[List[str]] = None
    method: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    pollingInterval: Optional[int] = None


class PollingTask:
    def __init__(self, client: Client, cfg: Dict[str, Any], webhook_url: str, polling_interval: int = 60):
        self.client = client
        self.cfg = cfg
        self.webhook_url = webhook_url
        self.polling_interval = max(10, polling_interval)
        self._task: Optional[asyncio.Task] = None
        self.state = cfg.get('state', {})

    async def start(self):
        self._task = asyncio.create_task(self._run())

    async def _run(self):
        while True:
            try:
                await self.poll_once()
                await asyncio.sleep(self.polling_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.exception('Polling error: %s', e)
                await asyncio.sleep(self.polling_interval)

    async def poll_once(self):
        method = self.cfg.get('method')
        if method == 'get_chat_history':
            chat_id = self.cfg['config'].get('chatId')
            limit = self.cfg['config'].get('limit', 100)
            only_new = self.cfg['config'].get('onlyNew', True)
            last_id = self.state.get('lastMessageId', 0)
            new_messages = []
            async for msg in self.client.get_chat_history(chat_id, limit=limit):
                if only_new and getattr(msg, 'id', 0) <= last_id:
                    break
                new_messages.append(msg)
            if new_messages:
                self.state['lastMessageId'] = new_messages[0].id
                payload = {
                    'triggerType': 'polling',
                    'method': method,
                    'chatId': chat_id,
                    'newMessages': [{'id': m.id, 'text': getattr(m, 'text', None), 'date': getattr(m, 'date', None).isoformat() if getattr(m, 'date', None) else None} for m in new_messages]
                }
                await self._post(payload)

    async def _post(self, payload: Dict[str, Any]):
        try:
            # use auth token from cfg if provided
            headers = {'Content-Type': 'application/json'}
            auth_token = self.cfg.get('config', {}).get('auth_token') or self.cfg.get('auth_token')
            if auth_token:
                headers['X-Trigger-Auth'] = auth_token
            async with aiohttp.ClientSession() as session:
                await session.post(self.webhook_url, json=payload, headers=headers, timeout=10)
        except Exception:
            logger.exception('Failed to POST polling payload')

    async def stop(self):
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except Exception:
                pass


class PyrogramTriggerService:
    def __init__(self, auth_token: Optional[str] = None):
        self.triggers: Dict[str, Dict[str, Any]] = {}
        self.auth_token = auth_token
        self._load_state()

    def _load_state(self):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.triggers = data.get('triggers', {})
        except Exception:
            self.triggers = {}

    def _save_state(self):
        try:
            with open(STATE_FILE, 'w', encoding='utf-8') as f:
                json.dump({'triggers': {tid: {'config': self.triggers[tid]['config']} for tid in self.triggers}}, f)
        except Exception:
            logger.exception('Failed to save trigger state')

    async def add_trigger(self, trigger_config: Dict[str, Any]) -> str:
        trigger_id = str(uuid.uuid4())
        trigger_type = trigger_config.get('triggerType')
        webhook_url = trigger_config.get('webhookUrl')
        api_id = trigger_config.get('api_id')
        api_hash = trigger_config.get('api_hash')
        session_string = trigger_config.get('session_string')
        bot_token = trigger_config.get('bot_token')

        client = Client(
            name=f'pyro_trigger_{trigger_id}',
            api_id=api_id,
            api_hash=api_hash,
            session_string=session_string,
            bot_token=bot_token,
            in_memory=True,
        )

        entry: Dict[str, Any] = {"config": trigger_config, "client": client, "task": None}
        self.triggers[trigger_id] = entry

        if trigger_type == 'message':
            await client.start()

            def _filter_builder(filters_cfg: Dict[str, Any]):
                f = filters.all

                # chatType may be a list of values
                chat_types = filters_cfg.get('chatType') or filters_cfg.get('chat_type')
                if chat_types:
                    # ensure list
                    if isinstance(chat_types, str):
                        chat_types = [chat_types]
                    type_filter = None
                    for t in chat_types:
                        tf = None
                        if t == 'private':
                            tf = filters.private
                        elif t == 'group':
                            tf = filters.group
                        elif t == 'channel':
                            tf = filters.channel
                        elif t == 'bot' and hasattr(filters, 'bot'):
                            tf = filters.bot
                        if tf is not None:
                            type_filter = tf if type_filter is None else (type_filter | tf)
                    if type_filter is not None:
                        f = f & type_filter

                # chatId filter
                chat_id = filters_cfg.get('chatId') or filters_cfg.get('chat_id')
                if chat_id:
                    try:
                        cid = int(str(chat_id))
                    except Exception:
                        cid = chat_id
                    f = f & filters.chat(cid)

                # userIds (comma-separated)
                user_ids = filters_cfg.get('userIds') or filters_cfg.get('user_ids')
                if user_ids:
                    if isinstance(user_ids, str):
                        ids = [int(x.strip()) for x in user_ids.split(',') if x.strip()]
                    elif isinstance(user_ids, list):
                        ids = [int(x) for x in user_ids]
                    else:
                        ids = []
                    if ids:
                        f = f & filters.user(ids)

                # text pattern (regex)
                text_pattern = filters_cfg.get('textPattern') or filters_cfg.get('text_pattern')
                if text_pattern:
                    f = f & filters.regex(text_pattern)

                # commands (comma-separated)
                commands = filters_cfg.get('commands')
                if commands:
                    if isinstance(commands, str):
                        cmds = [c.strip() for c in commands.split(',') if c.strip()]
                    elif isinstance(commands, list):
                        cmds = commands
                    else:
                        cmds = []
                    if cmds:
                        try:
                            f = f & filters.command(cmds)
                        except Exception:
                            # fallback: match by regex for commands without pyrogram command filter
                            pattern = '|'.join([r"^/" + re.escape(c) for c in cmds])
                            f = f & filters.regex(pattern)

                return f

            import re

            filters_cfg = trigger_config.get('filters', trigger_config.get('messageFilters', {}))
            f = _filter_builder(filters_cfg)

            async def _on_message(client_obj, message):
                payload = {
                    'triggerType': 'message',
                    'trigger_id': trigger_id,
                    'messageId': getattr(message, 'id', None),
                    'text': getattr(message, 'text', None) or getattr(message, 'caption', None),
                    'chatId': message.chat.id if hasattr(message, 'chat') else None,
                    'chatType': message.chat.type if hasattr(message, 'chat') else None,
                    'userId': message.from_user.id if getattr(message, 'from_user', None) else None,
                    'userName': message.from_user.username if getattr(message, 'from_user', None) else None,
                    'date': message.date.isoformat() if getattr(message, 'date', None) else None,
                }
                await self._post_webhook(webhook_url, payload, trigger_id)

            client.add_handler(_on_message, filters=f)

        elif trigger_type == 'update':
            # specific update handlers: register handler that posts selected update events
            await client.start()
            handlers_list = trigger_config.get('updateHandlers') or trigger_config.get('update_handlers') or []
            # mapping from handler key to expected pyrogram type class name
            mapping = {
                'on_callback_query': 'CallbackQuery',
                'on_inline_query': 'InlineQuery',
                'on_chosen_inline_result': 'ChosenInlineResult',
                'on_chat_member_updated': 'ChatMemberUpdated',
                'on_user_status': 'UserStatus',
                'on_poll': 'Poll',
                'on_poll_answer': 'PollAnswer',
                'on_chat_join_request': 'ChatJoinRequest',
            }
            expected_names = [mapping[h] for h in handlers_list if h in mapping]

            async def _on_selected_update(client_obj, update_obj):
                try:
                    cls_name = update_obj.__class__.__name__
                    if cls_name not in expected_names:
                        return
                    payload = {
                        'triggerType': 'update',
                        'trigger_id': trigger_id,
                        'event': cls_name,
                        'data': str(update_obj)
                    }
                    await self._post_webhook(webhook_url, payload, trigger_id)
                except Exception:
                    logger.exception('Error handling selected update event')

            client.add_handler(_on_selected_update, filters.all)
            logger.debug('Registered update handler for trigger %s events=%s', trigger_id, expected_names)

        elif trigger_type == 'polling':
            # start client and polling task
            await client.start()
            polling_interval = int(trigger_config.get('pollingInterval', 60))
            task = PollingTask(client, trigger_config, webhook_url, polling_interval)
            await task.start()
            entry['task'] = task

        # Save minimal state
        logger.debug('Added trigger %s type=%s webhook=%s', trigger_id, trigger_type, webhook_url)
        self._save_state()
        return trigger_id

    async def remove_trigger(self, trigger_id: str) -> bool:
        entry = self.triggers.get(trigger_id)
        if not entry:
            return False
        client: Client = entry.get('client')
        try:
            # stop polling task if present
            task_obj = entry.get('task')
            if task_obj:
                await task_obj.stop()
            await client.stop()
        except Exception:
            logger.exception('Error stopping client for trigger %s', trigger_id)
        del self.triggers[trigger_id]
        self._save_state()
        return True

    async def list_triggers(self) -> Dict[str, Any]:
        return {tid: {'config': self.triggers[tid]['config']} for tid in self.triggers}

    async def _post_webhook(self, webhook_url: str, payload: Dict[str, Any], trigger_id: str = None):
        headers = {'Content-Type': 'application/json'}
        # prefer per-trigger auth token
        auth_token = None
        if trigger_id and trigger_id in self.triggers:
            cfg = self.triggers[trigger_id]['config']
            auth_token = cfg.get('auth_token') or cfg.get('config', {}).get('auth_token')
        if not auth_token:
            auth_token = self.auth_token
        if auth_token:
            headers['X-Trigger-Auth'] = auth_token
        logger.debug('Posting webhook to %s headers=%s payload_keys=%s', webhook_url, list(headers.keys()), list(payload.keys()))
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(webhook_url, json=payload, headers=headers, timeout=10)
        except Exception:
            logger.exception('Failed to POST webhook payload')

    async def stop_all(self):
        for tid in list(self.triggers.keys()):
            await self.remove_trigger(tid)


# instantiate service
_trigger_service = PyrogramTriggerService()


# --- Existing endpoints ---

@app.get("/health")
def health():
    return {"status": "ok"}


# Endpoint: Authorize and get session string
@app.post("/auth")
async def auth(req: AuthRequest):
    if req.session_string:
        # Already have session string, just return it
        return {"session_string": req.session_string}
    if req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    elif req.phone_number:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            phone_number=req.phone_number,
            in_memory=True
        )
    else:
        return {"error": "Provide either session_string, bot_token, or phone_number"}

    await client.start()
    session_string = await client.export_session_string()
    await client.stop()
    return {"session_string": session_string}


# Endpoint: Send message
@app.post("/send_message")
async def send_message(req: SendMessageRequest):
    # Use session string or bot token
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_message(
        chat_id=req.chat_id,
        text=req.text,
        parse_mode=req.parse_mode,
        disable_notification=req.disable_notification
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

# TODO: Реалізувати endpoint-и для всіх основних Pyrogram-операцій згідно ТЗ:
# - Messages Resource (send_voice, send_video_note, send_animation, send_sticker, send_location, send_venue, send_contact, send_poll, send_dice, forward_message, copy_message, edit_message_text, edit_message_caption, edit_message_media, delete_message, get_messages, get_message_history, search_messages, download_media)
# - Chats Resource
# - Users Resource
# - Contacts Resource
# - Bot Resource
# - Stories Resource
# - Reactions Resource
# - Advanced Resource
# Перевірити, які endpoint-и вже реалізовано нижче:
class SendPhotoRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    photo: str  # file path, URL, or file_id
    caption: Optional[str] = None
    parse_mode: Optional[str] = None
    ttl_seconds: Optional[int] = None

@app.post("/send_photo")
async def send_photo(req: SendPhotoRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_photo(
        chat_id=req.chat_id,
        photo=req.photo,
        caption=req.caption,
        parse_mode=req.parse_mode,
        ttl_seconds=req.ttl_seconds
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendVideoRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    video: str
    caption: Optional[str] = None
    duration: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    thumb: Optional[str] = None
    supports_streaming: Optional[bool] = None

@app.post("/send_video")
async def send_video(req: SendVideoRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_video(
        chat_id=req.chat_id,
        video=req.video,
        caption=req.caption,
        duration=req.duration,
        width=req.width,
        height=req.height,
        thumb=req.thumb,
        supports_streaming=req.supports_streaming
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendAudioRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    audio: str
    caption: Optional[str] = None
    duration: Optional[int] = None
    performer: Optional[str] = None
    title: Optional[str] = None

@app.post("/send_audio")
async def send_audio(req: SendAudioRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_audio(
        chat_id=req.chat_id,
        audio=req.audio,
        caption=req.caption,
        duration=req.duration,
        performer=req.performer,
        title=req.title
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendDocumentRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    document: str
    caption: Optional[str] = None
    parse_mode: Optional[str] = None
    file_name: Optional[str] = None

@app.post("/send_document")
async def send_document(req: SendDocumentRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_document(
        chat_id=req.chat_id,
        document=req.document,
        caption=req.caption,
        parse_mode=req.parse_mode,
        file_name=req.file_name
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendVoiceRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    voice: str
    caption: Optional[str] = None
    duration: Optional[int] = None

@app.post("/send_voice")
async def send_voice(req: SendVoiceRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_voice(
        chat_id=req.chat_id,
        voice=req.voice,
        caption=req.caption,
        duration=req.duration
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendVideoNoteRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    video_note: str
    duration: Optional[int] = None
    length: Optional[int] = None
    thumb: Optional[str] = None

@app.post("/send_video_note")
async def send_video_note(req: SendVideoNoteRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_video_note(
        chat_id=req.chat_id,
        video_note=req.video_note,
        duration=req.duration,
        length=req.length,
        thumb=req.thumb
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendAnimationRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    animation: str
    caption: Optional[str] = None
    duration: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None

@app.post("/send_animation")
async def send_animation(req: SendAnimationRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_animation(
        chat_id=req.chat_id,
        animation=req.animation,
        caption=req.caption,
        duration=req.duration,
        width=req.width,
        height=req.height
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendStickerRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    sticker: str
    emoji: Optional[str] = None
    disable_notification: Optional[bool] = False

@app.post("/send_sticker")
async def send_sticker(req: SendStickerRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_sticker(
        chat_id=req.chat_id,
        sticker=req.sticker,
        emoji=req.emoji,
        disable_notification=req.disable_notification
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendLocationRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    latitude: float
    longitude: float
    live_period: Optional[int] = None
    heading: Optional[int] = None
    proximity_alert_radius: Optional[int] = None

@app.post("/send_location")
async def send_location(req: SendLocationRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_location(
        chat_id=req.chat_id,
        latitude=req.latitude,
        longitude=req.longitude,
        live_period=req.live_period,
        heading=req.heading,
        proximity_alert_radius=req.proximity_alert_radius
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendVenueRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    latitude: float
    longitude: float
    title: str
    address: str
    foursquare_id: Optional[str] = None
    foursquare_type: Optional[str] = None
    google_place_id: Optional[str] = None
    google_place_type: Optional[str] = None

@app.post("/send_venue")
async def send_venue(req: SendVenueRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_venue(
        chat_id=req.chat_id,
        latitude=req.latitude,
        longitude=req.longitude,
        title=req.title,
        address=req.address,
        foursquare_id=req.foursquare_id,
        foursquare_type=req.foursquare_type,
        google_place_id=req.google_place_id,
        google_place_type=req.google_place_type
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendContactRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    phone_number: str
    first_name: str
    last_name: Optional[str] = None
    vcard: Optional[str] = None

@app.post("/send_contact")
async def send_contact(req: SendContactRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_contact(
        chat_id=req.chat_id,
        phone_number=req.phone_number,
        first_name=req.first_name,
        last_name=req.last_name,
        vcard=req.vcard
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendPollRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    question: str
    options: list[str]
    is_anonymous: Optional[bool] = True
    type: Optional[str] = "regular"
    allows_multiple_answers: Optional[bool] = False
    correct_option_id: Optional[int] = None
    explanation: Optional[str] = None
    open_period: Optional[int] = None
    close_date: Optional[int] = None
    is_closed: Optional[bool] = False

@app.post("/send_poll")
async def send_poll(req: SendPollRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_poll(
        chat_id=req.chat_id,
        question=req.question,
        options=req.options,
        is_anonymous=req.is_anonymous,
        type=req.type,
        allows_multiple_answers=req.allows_multiple_answers,
        correct_option_id=req.correct_option_id,
        explanation=req.explanation,
        open_period=req.open_period,
        close_date=req.close_date,
        is_closed=req.is_closed
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class SendDiceRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    emoji: Optional[str] = None

@app.post("/send_dice")
async def send_dice(req: SendDiceRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.send_dice(
        chat_id=req.chat_id,
        emoji=req.emoji
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date, "value": msg.dice.value if msg.dice else None}

class ForwardMessageRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    from_chat_id: int
    message_id: int
    disable_notification: Optional[bool] = False

@app.post("/forward_message")
async def forward_message(req: ForwardMessageRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.forward_messages(
        chat_id=req.chat_id,
        from_chat_id=req.from_chat_id,
        message_ids=[req.message_id],
        disable_notification=req.disable_notification
    )
    await client.stop()
    return {"message_id": msg[0].id if msg else None, "chat_id": msg[0].chat.id if msg else None, "date": msg[0].date if msg else None}

class CopyMessageRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    from_chat_id: int
    message_id: int
    caption: Optional[str] = None
    parse_mode: Optional[str] = None
    disable_notification: Optional[bool] = False

@app.post("/copy_message")
async def copy_message(req: CopyMessageRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.copy_message(
        chat_id=req.chat_id,
        from_chat_id=req.from_chat_id,
        message_id=req.message_id,
        caption=req.caption,
        parse_mode=req.parse_mode,
        disable_notification=req.disable_notification
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class EditMessageTextRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    message_id: int
    text: str
    parse_mode: Optional[str] = None

@app.post("/edit_message_text")
async def edit_message_text(req: EditMessageTextRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.edit_message_text(
        chat_id=req.chat_id,
        message_id=req.message_id,
        text=req.text,
        parse_mode=req.parse_mode
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class EditMessageCaptionRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    message_id: int
    caption: str
    parse_mode: Optional[str] = None

@app.post("/edit_message_caption")
async def edit_message_caption(req: EditMessageCaptionRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.edit_message_caption(
        chat_id=req.chat_id,
        message_id=req.message_id,
        caption=req.caption,
        parse_mode=req.parse_mode
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class EditMessageMediaRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    message_id: int
    media: str  # file path, URL, or file_id
    media_type: str  # 'photo', 'video', etc.
    caption: Optional[str] = None
    parse_mode: Optional[str] = None

@app.post("/edit_message_media")
async def edit_message_media(req: EditMessageMediaRequest):
    from pyrogram.types import InputMediaPhoto, InputMediaVideo
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    if req.media_type == 'photo':
        media = InputMediaPhoto(media=req.media, caption=req.caption, parse_mode=req.parse_mode)
    elif req.media_type == 'video':
        media = InputMediaVideo(media=req.media, caption=req.caption, parse_mode=req.parse_mode)
    else:
        await client.stop()
        return {"error": "Unsupported media_type"}
    msg = await client.edit_message_media(
        chat_id=req.chat_id,
        message_id=req.message_id,
        media=media
    )
    await client.stop()
    return {"message_id": msg.id, "chat_id": msg.chat.id, "date": msg.date}

class DeleteMessageRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    message_id: int

@app.post("/delete_message")
async def delete_message(req: DeleteMessageRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.delete_messages(
        chat_id=req.chat_id,
        message_ids=[req.message_id]
    )
    await client.stop()
    return {"result": result}

class GetMessagesRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    message_ids: list[int]

@app.post("/get_messages")
async def get_messages(req: GetMessagesRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msgs = await client.get_messages(
        chat_id=req.chat_id,
        message_ids=req.message_ids
    )
    await client.stop()
    return {"messages": [msg.text if hasattr(msg, 'text') else None for msg in (msgs if isinstance(msgs, list) else [msgs]) ]}

class GetMessageHistoryRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    limit: Optional[int] = 10
    offset_id: Optional[int] = 0

@app.post("/get_message_history")
async def get_message_history(req: GetMessageHistoryRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msgs = []
    async for msg in client.get_chat_history(
        chat_id=req.chat_id,
        limit=req.limit,
        offset_id=req.offset_id
    ):
        msgs.append({"id": msg.id, "text": getattr(msg, 'text', None), "date": msg.date})
    await client.stop()
    return {"messages": msgs}

class SearchMessagesRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    query: str
    limit: Optional[int] = 10

@app.post("/search_messages")
async def search_messages(req: SearchMessagesRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msgs = []
    async for msg in client.search_messages(
        chat_id=req.chat_id,
        query=req.query,
        limit=req.limit
    ):
        msgs.append({"id": msg.id, "text": getattr(msg, 'text', None), "date": msg.date})
    await client.stop()
    return {"messages": msgs}

class DownloadMediaRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    message_id: int
    file_name: Optional[str] = None

@app.post("/download_media")
async def download_media(req: DownloadMediaRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    msg = await client.get_messages(
        chat_id=req.chat_id,
        message_ids=[req.message_id]
    )
    if isinstance(msg, list):
        msg = msg[0]
    file_path = await client.download_media(
        message=msg,
        file_name=req.file_name
    )
    await client.stop()
    return {"file_path": file_path}

class GetChatRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int

@app.post("/get_chat")
async def get_chat(req: GetChatRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    chat = await client.get_chat(req.chat_id)
    await client.stop()
    return {"id": chat.id, "title": getattr(chat, 'title', None), "type": chat.type, "username": getattr(chat, 'username', None)}

class GetChatMembersRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    limit: Optional[int] = 10
    offset: Optional[int] = 0

@app.post("/get_chat_members")
async def get_chat_members(req: GetChatMembersRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    members = []
    async for member in client.get_chat_members(req.chat_id, limit=req.limit, offset=req.offset):
        members.append({"user_id": member.user.id, "status": member.status, "username": getattr(member.user, 'username', None)})
    await client.stop()
    return {"members": members}

class GetChatMemberRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    user_id: int

@app.post("/get_chat_member")
async def get_chat_member(req: GetChatMemberRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    member = await client.get_chat_member(req.chat_id, req.user_id)
    await client.stop()
    return {"user_id": member.user.id, "status": member.status, "username": getattr(member.user, 'username', None)}

class GetChatAdministratorsRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int

@app.post("/get_chat_administrators")
async def get_chat_administrators(req: GetChatAdministratorsRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    admins = await client.get_chat_members(req.chat_id, filter="administrators")
    result = []
    async for admin in admins:
        result.append({"user_id": admin.user.id, "status": admin.status, "username": getattr(admin.user, 'username', None)})
    await client.stop()
    return {"administrators": result}

class LeaveChatRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int

@app.post("/leave_chat")
async def leave_chat(req: LeaveChatRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.leave_chat(req.chat_id)
    await client.stop()
    return {"result": result}

class SetChatTitleRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    title: str

@app.post("/set_chat_title")
async def set_chat_title(req: SetChatTitleRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.set_chat_title(req.chat_id, req.title)
    await client.stop()
    return {"result": result}

class SetChatPhotoRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    photo: str  # file path, URL, or file_id

@app.post("/set_chat_photo")
async def set_chat_photo(req: SetChatPhotoRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.set_chat_photo(req.chat_id, req.photo)
    await client.stop()
    return {"result": result}

class DeleteChatPhotoRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int

@app.post("/delete_chat_photo")
async def delete_chat_photo(req: DeleteChatPhotoRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.delete_chat_photo(req.chat_id)
    await client.stop()
    return {"result": result}

class GetMeRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None

@app.post("/get_me")
async def get_me(req: GetMeRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    me = await client.get_me()
    await client.stop()
    return {"id": me.id, "is_bot": me.is_bot, "first_name": me.first_name, "username": getattr(me, 'username', None)}

class GetUsersRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    user_ids: list[int]

@app.post("/get_users")
async def get_users(req: GetUsersRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    users = await client.get_users(req.user_ids)
    await client.stop()
    return {"users": [{"id": u.id, "first_name": u.first_name, "username": getattr(u, 'username', None)} for u in (users if isinstance(users, list) else [users]) ]}

class GetUserProfilePhotosRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    user_id: int
    limit: Optional[int] = 10
    offset: Optional[int] = 0

@app.post("/get_user_profile_photos")
async def get_user_profile_photos(req: GetUserProfilePhotosRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    photos = await client.get_profile_photos(req.user_id, limit=req.limit, offset=req.offset)
    await client.stop()
    return {"photos": [p.file_id for p in photos]}

class GetContactsRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None

@app.post("/get_contacts")
async def get_contacts(req: GetContactsRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    contacts = await client.get_contacts()
    await client.stop()
    return {"contacts": [{"user_id": c.user.id, "first_name": c.user.first_name, "phone_number": getattr(c.user, 'phone_number', None)} for c in contacts]}

class AddContactRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    phone_number: str
    first_name: str
    last_name: Optional[str] = None
    user_id: Optional[int] = None

@app.post("/add_contact")
async def add_contact(req: AddContactRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    contact = await client.add_contact(
        phone_number=req.phone_number,
        first_name=req.first_name,
        last_name=req.last_name,
        user_id=req.user_id
    )
    await client.stop()
    return {"user_id": contact.id, "first_name": contact.first_name, "last_name": getattr(contact, 'last_name', None)}

class DeleteContactsRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    user_ids: list[int]

@app.post("/delete_contacts")
async def delete_contacts(req: DeleteContactsRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.delete_contacts(req.user_ids)
    await client.stop()
    return {"result": result}

class GetBotCommandsRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None

@app.post("/get_bot_commands")
async def get_bot_commands(req: GetBotCommandsRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    commands = await client.get_bot_commands()
    await client.stop()
    return {"commands": [{"command": c.command, "description": c.description} for c in commands]}

class SetBotCommandsRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    commands: list[dict]

@app.post("/set_bot_commands")
async def set_bot_commands(req: SetBotCommandsRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.set_bot_commands(req.commands)
    await client.stop()
    return {"result": result}

class DeleteBotCommandsRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None

@app.post("/delete_bot_commands")
async def delete_bot_commands(req: DeleteBotCommandsRequest):
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}

    await client.start()
    result = await client.delete_bot_commands()
    await client.stop()
    return {"result": result}

# API version endpoint
@app.get("/version")
def version():
    """Get API version"""
    return {"version": "1.0.0"}

# Test connection endpoint
@app.get("/test_connection")
def test_connection():
    """Test backend connection"""
    return {"status": "ok"}

# Stories Resource (stub)
@app.post("/get_stories")
async def get_stories():
    """Stories API not implemented in Pyrogram"""
    return JSONResponse(status_code=501, content={"error": "Stories API not implemented in Pyrogram"})

# Reactions Resource (stub)
@app.post("/get_reactions")
async def get_reactions():
    """Reactions API not implemented in Pyrogram"""
    return JSONResponse(status_code=501, content={"error": "Reactions API not implemented in Pyrogram"})

# Advanced Resource: raw API call
class RawApiRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    method: str
    params: dict

@app.post("/raw_api")
async def raw_api(req: RawApiRequest):
    """Call any raw Pyrogram API method (advanced)"""
    if req.session_string:
        client = Client(
            name="user",
            api_id=req.api_id,
            api_hash=req.api_hash,
            session_string=req.session_string,
            in_memory=True
        )
    elif req.bot_token:
        client = Client(
            name="bot",
            api_id=req.api_id,
            api_hash=req.api_hash,
            bot_token=req.bot_token,
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}
    await client.start()
    try:
        result = await client.invoke(method=req.method, params=req.params)
    except Exception as e:
        await client.stop()
        return {"error": str(e)}
    await client.stop()
    return {"result": str(result)}

# --- New endpoints for missing operations (stubs, to be implemented) ---
from fastapi import Body

@app.post("/send_media_group")
async def send_media_group(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    media: list = Body(...),
    disable_notification: bool = Body(False),
    reply_to_message_id: int = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/send_chat_action")
async def send_chat_action(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    action: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/send_cached_media")
async def send_cached_media(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    file_id: str = Body(...),
    caption: str = Body(None),
    parse_mode: str = Body(None),
    disable_notification: bool = Body(False)
):
    return {"error": "Not implemented yet"}

@app.post("/batch_send_messages")
async def batch_send_messages(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    messages: list = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/schedule_message")
async def schedule_message(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    text: str = Body(...),
    schedule_date: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_history_count")
async def get_chat_history_count(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/get_dialogs")
async def get_dialogs(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    limit: int = Body(20),
    offset_date: int = Body(None),
    offset_id: int = Body(None),
    offset_peer: int = Body(None),
    folder_id: int = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/get_dialogs_count")
async def get_dialogs_count(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    pinned_only: bool = Body(False)
):
    return {"error": "Not implemented yet"}

@app.post("/set_chat_permissions")
async def set_chat_permissions(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    permissions: dict = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/pin_chat_message")
async def pin_chat_message(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    message_id: int = Body(...),
    disable_notification: bool = Body(False),
    both_sides: bool = Body(False)
):
    return {"error": "Not implemented yet"}

@app.post("/unpin_chat_message")
async def unpin_chat_message(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    message_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/unpin_all_chat_messages")
async def unpin_all_chat_messages(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/set_chat_description")
async def set_chat_description(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    description: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/set_chat_username")
async def set_chat_username(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    username: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/block_user")
async def block_user(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    user_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/unblock_user")
async def unblock_user(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    user_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/set_profile_photo")
async def set_profile_photo(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    photo: str = Body(...),
    video: str = Body(None),
    video_start_ts: int = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/delete_profile_photos")
async def delete_profile_photos(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    photo_ids: list = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/update_profile")
async def update_profile(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    first_name: str = Body(None),
    last_name: str = Body(None),
    bio: str = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/get_common_chats")
async def get_common_chats(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    user_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/set_emoji_status")
async def set_emoji_status(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    emoji_status: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/import_contacts")
async def import_contacts(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    contacts: list = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/get_contacts_count")
async def get_contacts_count(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_invite_link_info")
async def get_chat_invite_link_info(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    invite_link: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/export_chat_invite_link")
async def export_chat_invite_link(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/create_chat_invite_link")
async def create_chat_invite_link(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    name: str = Body(None),
    expire_date: int = Body(None),
    member_limit: int = Body(None),
    creates_join_request: bool = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/edit_chat_invite_link")
async def edit_chat_invite_link(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    invite_link: str = Body(...),
    name: str = Body(None),
    expire_date: int = Body(None),
    member_limit: int = Body(None),
    creates_join_request: bool = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/revoke_chat_invite_link")
async def revoke_chat_invite_link(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    invite_link: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/delete_chat_invite_link")
async def delete_chat_invite_link(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    invite_link: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_invite_link_members")
async def get_chat_invite_link_members(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    invite_link: str = Body(...),
    limit: int = Body(None),
    offset: int = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_invite_link_members_count")
async def get_chat_invite_link_members_count(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    invite_link: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_invite_links")
async def get_chat_invite_links(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    admin_id: int = Body(None),
    limit: int = Body(None),
    offset: int = Body(None),
    revoked: bool = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_invite_links_count")
async def get_chat_invite_links_count(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    admin_id: int = Body(None),
    revoked: bool = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_admins_with_invite_links")
async def get_chat_admins_with_invite_links(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/get_chat_join_requests")
async def get_chat_join_requests(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    limit: int = Body(None),
    query: str = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/delete_all_revoked_chat_invite_links")
async def delete_all_revoked_chat_invite_links(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    admin_id: int = Body(None)
):
    return {"error": "Not implemented yet"}

@app.post("/approve_chat_join_request")
async def approve_chat_join_request(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    user_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/approve_all_chat_join_requests")
async def approve_all_chat_join_requests(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    invite_link: str = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/decline_chat_join_request")
async def decline_chat_join_request(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    user_id: int = Body(...)
):
    return {"error": "Not implemented yet"}

@app.post("/decline_all_chat_join_requests")
async def decline_all_chat_join_requests(
    api_id: int = Body(...),
    api_hash: str = Body(...),
    session_string: str = Body(None),
    bot_token: str = Body(None),
    chat_id: int = Body(...),
    invite_link: str = Body(...)
):
    return {"error": "Not implemented yet"}
