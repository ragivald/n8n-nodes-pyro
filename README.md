# n8n-nodes-pyro

n8n community node для інтеграції з Pyro FastAPI backend (Pyrogram API).

## Встановлення

1. Склонуйте репозиторій у папку `~/.n8n/custom/nodes/n8n-nodes-pyro` або у власний проєкт.
2. Встановіть залежності: `npm install`.
3. Зберіть TypeScript: `npm run build`.
4. Перезапустіть n8n.

## Креденшли

- **Base URL**: URL вашого Pyro FastAPI backend (наприклад, http://localhost:8000)
- **API ID**: Telegram API ID
- **API Hash**: Telegram API Hash
- **Session String**: Pyrogram session string (опціонально)
- **Phone Number**: Telegram phone number (опціонально)
- **Bot Token**: Telegram bot token (опціонально)

## Ресурси та операції

### Messages

- Надсилання повідомлень, медіа, редагування, видалення, історія, пошук, завантаження медіа тощо.
- Операції: send_message, send_photo, send_audio, send_document, send_voice, send_video, send_video_note, send_animation, send_sticker, send_location, send_venue, send_contact, send_poll, send_dice, forward_message, copy_message, edit_message_text, edit_message_caption, edit_message_media, delete_message, get_messages, get_message_history, search_messages, download_media.

### Chats

- Отримання інформації про чати, учасників, адміністраторів, зміна назви/фото, вихід з чату.
- Операції: get_chat, get_chat_members, get_chat_member, get_chat_administrators, leave_chat, set_chat_title, set_chat_photo, delete_chat_photo.

### Users

- Інформація про користувачів, фото профілю.
- Операції: get_me, get_users, get_user_profile_photos.

### Contacts

- Робота з контактами: отримання, додавання, видалення.
- Операції: get_contacts, add_contact, delete_contacts.

### Bot

- Робота з командами бота.
- Операції: get_bot_commands, set_bot_commands, delete_bot_commands.

### Stories

- Отримання stories (базова підтримка).

### Reactions

- Отримання reactions (базова підтримка).

### Advanced

- Raw API: виклик будь-якого Pyrogram-методу через method+params (JSON).

## Приклади використання

### Надіслати повідомлення

- Resource: Messages
- Operation: Send Message
- Chat ID: `@username` або ID чату
- Text: `Привіт!`

### Отримати учасників чату

- Resource: Chats
- Operation: Get Chat Members
- Chat ID: `@groupname` або ID чату
- Limit: 10

### Викликати raw Pyrogram API

- Resource: Advanced
- Operation: Raw API
- Method: `get_history`
- Params: `{ "chat_id": "@username", "limit": 5 }`

## Пояснення параметрів

- **chat_id**: ID або username чату/каналу
- **user_id**: ID користувача
- **text**: Текст повідомлення
- **photo/audio/video/document**: URL, шлях до файлу або file_id
- **parse_mode**: Markdown, HTML або None
- **limit/offset**: Ліміти для історії, учасників тощо
- **commands**: JSON-масив для set_bot_commands
- **method/params**: для raw_api

## Ліцензія

MIT
