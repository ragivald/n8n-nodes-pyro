import asyncio
import logging
import uuid
import json
from typing import Dict, Any, Optional

import aiohttp
from pyrogram import Client, filters

logger = logging.getLogger(__name__)

STATE_FILE = 'trigger_state.json'


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
                # basic filters: chatId and textPattern
                chat_id = filters_cfg.get('chatId')
                text_pattern = filters_cfg.get('textPattern')
                if chat_id:
                    f = f & filters.chat(chat_id)
                if text_pattern:
                    f = f & filters.regex(text_pattern)
                return f

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

        elif trigger_type == 'polling':
            # start client and polling task
            await client.start()
            polling_interval = int(trigger_config.get('pollingInterval', 60))
            task = PollingTask(client, trigger_config, webhook_url, polling_interval)
            await task.start()
            entry['task'] = task

        # Save minimal state
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
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(webhook_url, json=payload, headers=headers, timeout=10)
        except Exception:
            logger.exception('Failed to POST webhook payload')

    async def stop_all(self):
        for tid in list(self.triggers.keys()):
            await self.remove_trigger(tid)
