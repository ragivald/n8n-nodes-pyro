from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pyrogram import Client
import os

app = FastAPI()


from pydantic import BaseModel
from typing import Optional
import asyncio

# Session and client management
tg_clients = {}

class AuthRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    phone_number: Optional[str] = None
    bot_token: Optional[str] = None

class SendMessageRequest(BaseModel):
    api_id: int
    api_hash: str
    session_string: Optional[str] = None
    bot_token: Optional[str] = None
    chat_id: int
    text: str
    parse_mode: Optional[str] = None
    disable_notification: Optional[bool] = False


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
        parse_mode=req.parse_mode if req.parse_mode else None,
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

# Add missing endpoints that n8n node might call
@app.post("/send_chat_action")
async def send_chat_action(req: dict):
    """Send chat action (typing, uploading, etc.)"""
    if req.get('session_string'):
        client = Client(
            name="user",
            api_id=req['api_id'],
            api_hash=req['api_hash'],
            session_string=req['session_string'],
            in_memory=True
        )
    elif req.get('bot_token'):
        client = Client(
            name="bot",
            api_id=req['api_id'],
            api_hash=req['api_hash'],
            bot_token=req['bot_token'],
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}
    
    await client.start()
    result = await client.send_chat_action(
        chat_id=req['chat_id'],
        action=req.get('action', 'typing')
    )
    await client.stop()
    return {"result": result}

@app.post("/join_chat")
async def join_chat(req: dict):
    """Join a chat"""
    if req.get('session_string'):
        client = Client(
            name="user",
            api_id=req['api_id'],
            api_hash=req['api_hash'],
            session_string=req['session_string'],
            in_memory=True
        )
    elif req.get('bot_token'):
        client = Client(
            name="bot",
            api_id=req['api_id'],
            api_hash=req['api_hash'],
            bot_token=req['bot_token'],
            in_memory=True
        )
    else:
        return {"error": "Provide session_string or bot_token"}
    
    await client.start()
    result = await client.join_chat(req['chat_id'])
    await client.stop()
    return {"chat": {"id": result.id, "title": getattr(result, 'title', None), "type": result.type}}

# Add alias endpoints for backward compatibility
@app.post("/forward_messages")
async def forward_messages_alias(req: ForwardMessageRequest):
    """Alias for forward_message"""
    return await forward_message(req)

@app.post("/copy_messages") 
async def copy_messages_alias(req: CopyMessageRequest):
    """Alias for copy_message"""
    return await copy_message(req)

@app.post("/delete_messages")
async def delete_messages_alias(req: DeleteMessageRequest):
    """Alias for delete_message"""
    return await delete_message(req)

@app.post("/get_chat_history")
async def get_chat_history_alias(req: GetMessageHistoryRequest):
    """Alias for get_message_history"""
    return await get_message_history(req)
