# Pyrogram n8n Community Node - Technical Specification

## Overview
Create a comprehensive n8n community node for Pyrogram, a modern, elegant and asynchronous MTProto API framework for Telegram. The node should expose all major Pyrogram functionalities as n8n operations.

## Node Structure

### Base Configuration
```typescript
{
  name: 'Pyrogram',
  displayName: 'Pyrogram',
  description: 'Interact with Telegram using Pyrogram MTProto API',
  icon: 'file:pyrogram.svg',
  group: ['transform'],
  version: 1,
  subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
  defaults: {
    name: 'Pyrogram',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'pyrogramApi',
      required: true,
    },
  ],
}
```

## Authentication Credentials

### PyrogramApi Credentials
```typescript
{
  name: 'pyrogramApi',
  displayName: 'Pyrogram API',
  properties: [
    {
      displayName: 'API ID',
      name: 'apiId',
      type: 'number',
      default: '',
      required: true,
      description: 'Telegram API ID from my.telegram.org',
    },
    {
      displayName: 'API Hash',
      name: 'apiHash',
      type: 'string',
      default: '',
      required: true,
      description: 'Telegram API Hash from my.telegram.org',
    },
    {
      displayName: 'Session String',
      name: 'sessionString',
      type: 'string',
      default: '',
      required: false,
      description: 'Pyrogram session string for persistent auth',
    },
    {
      displayName: 'Phone Number',
      name: 'phoneNumber',
      type: 'string',
      default: '',
      required: false,
      description: 'Phone number for authentication (if no session string)',
    },
    {
      displayName: 'Bot Token',
      name: 'botToken',
      type: 'string',
      default: '',
      required: false,
      description: 'Bot token for bot authentication',
    },
  ],
}
```

## Resources and Operations

### 1. Messages Resource

#### Operations:
- **Send Message**
  - Parameters: chat_id, text, parse_mode, entities, link_preview, reply_to_message_id, schedule_date
  - Features: Support for Markdown/HTML, disable notification, protect content
  
- **Send Photo**
  - Parameters: chat_id, photo (file/URL/file_id), caption, parse_mode, ttl_seconds
  
- **Send Video**
  - Parameters: chat_id, video, caption, duration, width, height, thumb, supports_streaming
  
- **Send Audio**
  - Parameters: chat_id, audio, caption, duration, performer, title
  
- **Send Document**
  - Parameters: chat_id, document, caption, parse_mode, file_name
  
- **Send Voice**
  - Parameters: chat_id, voice, caption, duration
  
- **Send Video Note**
  - Parameters: chat_id, video_note, duration, length, thumb
  
- **Send Animation**
  - Parameters: chat_id, animation, caption, duration, width, height
  
- **Send Sticker**
  - Parameters: chat_id, sticker, emoji
  
- **Send Location**
  - Parameters: chat_id, latitude, longitude, horizontal_accuracy, live_period
  
- **Send Venue**
  - Parameters: chat_id, latitude, longitude, title, address, foursquare_id
  
- **Send Contact**
  - Parameters: chat_id, phone_number, first_name, last_name, vcard
  
- **Send Poll**
  - Parameters: chat_id, question, options, is_anonymous, type, allows_multiple_answers
  
- **Send Dice**
  - Parameters: chat_id, emoji
  
- **Send Media Group**
  - Parameters: chat_id, media (array of InputMedia), disable_notification, reply_to_message_id
  
- **Send Cached Media**
  - Parameters: chat_id, file_id, caption, parse_mode, disable_notification
  
- **Forward Messages**
  - Parameters: chat_id, from_chat_id, message_ids, disable_notification, schedule_date
  
- **Copy Messages**
  - Parameters: chat_id, from_chat_id, message_ids, captions, parse_mode
  
- **Copy Media Group**
  - Parameters: chat_id, from_chat_id, message_id, captions, parse_mode
  
- **Edit Message Text**
  - Parameters: chat_id, message_id, text, parse_mode, entities, link_preview
  
- **Edit Message Caption**
  - Parameters: chat_id, message_id, caption, parse_mode
  
- **Edit Message Media**
  - Parameters: chat_id, message_id, media
  
- **Edit Message Reply Markup**
  - Parameters: chat_id, message_id, reply_markup
  
- **Edit Inline Text**
  - Parameters: inline_message_id, text, parse_mode, entities, link_preview
  
- **Edit Inline Caption**
  - Parameters: inline_message_id, caption, parse_mode
  
- **Edit Inline Media**
  - Parameters: inline_message_id, media
  
- **Edit Inline Reply Markup**
  - Parameters: inline_message_id, reply_markup
  
- **Delete Messages**
  - Parameters: chat_id, message_ids, revoke
  
- **Get Messages**
  - Parameters: chat_id, message_ids, replies, reply_to_message_ids
  
- **Get Media Group**
  - Parameters: chat_id, message_id
  
- **Get Chat History**
  - Parameters: chat_id, limit, offset, offset_id, offset_date, reverse
  
- **Get Chat History Count**
  - Parameters: chat_id
  
- **Read Chat History**
  - Parameters: chat_id, max_id
  
- **Send Chat Action**
  - Parameters: chat_id, action (typing, upload_photo, record_video, etc.)
  
- **Search Messages**
  - Parameters: chat_id, query, filter, limit, offset, from_user
  
- **Search Messages Count**
  - Parameters: chat_id, query, filter, from_user
  
- **Search Global**
  - Parameters: query, filter, limit, offset
  
- **Search Global Count**
  - Parameters: query, filter
  
- **Vote Poll**
  - Parameters: chat_id, message_id, options
  
- **Stop Poll**
  - Parameters: chat_id, message_id, reply_markup
  
- **Retract Vote**
  - Parameters: chat_id, message_id
  
- **Send Reaction**
  - Parameters: chat_id, message_id, emoji, big
  
- **Download Media**
  - Parameters: message, file_name, in_memory, block, progress
  
- **Stream Media**
  - Parameters: message, limit, offset
  
- **Get Discussion Message**
  - Parameters: chat_id, message_id
  
- **Get Discussion Replies**
  - Parameters: chat_id, message_id, limit, offset, offset_id, offset_date
  
- **Get Discussion Replies Count**
  - Parameters: chat_id, message_id
  
- **Get Custom Emoji Stickers**
  - Parameters: custom_emoji_ids

### 2. Chats Resource

#### Operations:
- **Join Chat**
  - Parameters: chat_id
  
- **Leave Chat**
  - Parameters: chat_id, delete
  
- **Ban Chat Member**
  - Parameters: chat_id, user_id, until_date
  
- **Unban Chat Member**
  - Parameters: chat_id, user_id
  
- **Restrict Chat Member**
  - Parameters: chat_id, user_id, permissions, until_date
  
- **Promote Chat Member**
  - Parameters: chat_id, user_id, privileges
  
- **Set Administrator Title**
  - Parameters: chat_id, user_id, title
  
- **Set Chat Photo**
  - Parameters: chat_id, photo, video, video_start_ts
  
- **Delete Chat Photo**
  - Parameters: chat_id
  
- **Set Chat Title**
  - Parameters: chat_id, title
  
- **Set Chat Description**
  - Parameters: chat_id, description
  
- **Set Chat Permissions**
  - Parameters: chat_id, permissions
  
- **Pin Chat Message**
  - Parameters: chat_id, message_id, disable_notification, both_sides
  
- **Unpin Chat Message**
  - Parameters: chat_id, message_id
  
- **Unpin All Chat Messages**
  - Parameters: chat_id
  
- **Get Chat**
  - Parameters: chat_id
  
- **Get Chat Member**
  - Parameters: chat_id, user_id
  
- **Get Chat Members**
  - Parameters: chat_id, query, limit, filter
  
- **Get Chat Members Count**
  - Parameters: chat_id
  
- **Get Dialogs**
  - Parameters: limit, offset_date, offset_id, offset_peer, folder_id
  
- **Get Dialogs Count**
  - Parameters: pinned_only
  
- **Set Chat Username**
  - Parameters: chat_id, username
  
- **Get Nearby Chats**
  - Parameters: latitude, longitude
  
- **Archive Chats**
  - Parameters: chat_ids
  
- **Unarchive Chats**
  - Parameters: chat_ids
  
- **Add Chat Members**
  - Parameters: chat_id, user_ids, forward_limit
  
- **Create Channel**
  - Parameters: title, description
  
- **Create Group**
  - Parameters: title, users
  
- **Create Supergroup**
  - Parameters: title, description
  
- **Delete Channel**
  - Parameters: chat_id
  
- **Delete Supergroup**
  - Parameters: chat_id
  
- **Delete User History**
  - Parameters: chat_id, user_id
  
- **Set Slow Mode**
  - Parameters: chat_id, seconds
  
- **Mark Chat Unread**
  - Parameters: chat_id
  
- **Get Chat Event Log**
  - Parameters: chat_id, query, offset_id, limit, filters, user_ids
  
- **Get Chat Online Count**
  - Parameters: chat_id
  
- **Get Send As Chats**
  - Parameters: chat_id
  
- **Set Send As Chat**
  - Parameters: chat_id, send_as_chat_id
  
- **Set Chat Protected Content**
  - Parameters: chat_id, enabled

### 3. Users Resource

#### Operations:
- **Get Me**
  - No parameters
  
- **Get Users**
  - Parameters: user_ids
  
- **Get Chat Photos**
  - Parameters: chat_id, limit, offset
  
- **Get Chat Photos Count**
  - Parameters: chat_id
  
- **Set Profile Photo**
  - Parameters: photo, video, video_start_ts
  
- **Delete Profile Photos**
  - Parameters: photo_ids
  
- **Set Username**
  - Parameters: username
  
- **Update Profile**
  - Parameters: first_name, last_name, bio
  
- **Block User**
  - Parameters: user_id
  
- **Unblock User**
  - Parameters: user_id
  
- **Get Common Chats**
  - Parameters: user_id
  
- **Get Default Emoji Statuses**
  - No parameters
  
- **Set Emoji Status**
  - Parameters: emoji_status

### 4. Contacts Resource

#### Operations:
- **Add Contact**
  - Parameters: user_id, first_name, last_name, phone_number, share_phone_number
  
- **Delete Contacts**
  - Parameters: user_ids
  
- **Import Contacts**
  - Parameters: contacts (array of InputPhoneContact)
  
- **Get Contacts**
  - No parameters
  
- **Get Contacts Count**
  - No parameters

### 5. Invite Links Resource

#### Operations:
- **Get Chat Invite Link Info**
  - Parameters: invite_link
  
- **Export Chat Invite Link**
  - Parameters: chat_id
  
- **Create Chat Invite Link**
  - Parameters: chat_id, name, expire_date, member_limit, creates_join_request
  
- **Edit Chat Invite Link**
  - Parameters: chat_id, invite_link, name, expire_date, member_limit, creates_join_request
  
- **Revoke Chat Invite Link**
  - Parameters: chat_id, invite_link
  
- **Delete Chat Invite Link**
  - Parameters: chat_id, invite_link
  
- **Get Chat Invite Link Members**
  - Parameters: chat_id, invite_link, limit, offset
  
- **Get Chat Invite Link Members Count**
  - Parameters: chat_id, invite_link
  
- **Get Chat Invite Links**
  - Parameters: chat_id, admin_id, limit, offset, revoked
  
- **Get Chat Invite Links Count**
  - Parameters: chat_id, admin_id, revoked
  
- **Get Chat Admins With Invite Links**
  - Parameters: chat_id
  
- **Get Chat Join Requests**
  - Parameters: chat_id, limit, query
  
- **Delete All Revoked Chat Invite Links**
  - Parameters: chat_id, admin_id
  
- **Approve Chat Join Request**
  - Parameters: chat_id, user_id
  
- **Approve All Chat Join Requests**
  - Parameters: chat_id, invite_link
  
- **Decline Chat Join Request**
  - Parameters: chat_id, user_id
  
- **Decline All Chat Join Requests**
  - Parameters: chat_id, invite_link

### 6. Password Resource

#### Operations:
- **Enable Cloud Password**
  - Parameters: password, hint, email
  
- **Change Cloud Password**
  - Parameters: current_password, new_password, new_hint, new_email
  
- **Remove Cloud Password**
  - Parameters: password

### 7. Bot-Specific Resource

#### Operations:
- **Get Inline Bot Results**
  - Parameters: bot, query, offset, latitude, longitude
  
- **Send Inline Bot Result**
  - Parameters: chat_id, query_id, result_id, disable_notification
  
- **Answer Callback Query**
  - Parameters: callback_query_id, text, show_alert, url, cache_time
  
- **Answer Inline Query**
  - Parameters: inline_query_id, results, cache_time, is_gallery, is_personal, next_offset, switch_pm_text, switch_pm_parameter
  
- **Request Callback Answer**
  - Parameters: chat_id, message_id, callback_data, timeout
  
- **Send Game**
  - Parameters: chat_id, game_short_name, disable_notification, reply_to_message_id
  
- **Set Game Score**
  - Parameters: user_id, score, force, disable_edit_message, chat_id, message_id
  
- **Get Game High Scores**
  - Parameters: user_id, chat_id, message_id
  
- **Set Bot Commands**
  - Parameters: commands, scope, language_code
  
- **Get Bot Commands**
  - Parameters: scope, language_code
  
- **Delete Bot Commands**
  - Parameters: scope, language_code
  
- **Set Bot Default Privileges**
  - Parameters: privileges, for_channels
  
- **Get Bot Default Privileges**
  - Parameters: for_channels
  
- **Set Chat Menu Button**
  - Parameters: chat_id, menu_button
  
- **Get Chat Menu Button**
  - Parameters: chat_id
  
- **Answer Web App Query**
  - Parameters: web_app_query_id, result

### 8. Utilities Resource

#### Operations:
- **Start**
  - No parameters - Start the client
  
- **Stop**
  - No parameters - Stop the client
  
- **Restart**
  - No parameters - Restart the client
  
- **Run**
  - No parameters - Start, idle, and stop the client
  
- **Add Handler**
  - Parameters: handler, group
  
- **Remove Handler**
  - Parameters: handler, group
  
- **Stop Transmission**
  - No parameters - Stop file upload/download
  
- **Export Session String**
  - No parameters - Export current session as string
  
- **Set Parse Mode**
  - Parameters: parse_mode (Markdown/HTML)
  
- **Idle**
  - No parameters - Block script execution until signal
  
- **Compose**
  - Parameters: clients - Run multiple clients at once

### 9. Advanced Resource

#### Operations:
- **Invoke**
  - Parameters: raw_function, retries, timeout, sleep_threshold
  - Description: Execute raw MTProto API functions
  
- **Resolve Peer**
  - Parameters: peer_id
  - Description: Get InputPeer from known peer ID
  
- **Save File**
  - Parameters: path, file_id, file_ref, file_name, in_memory, block, progress, progress_args
  - Description: Upload file to Telegram servers without sending

### 10. Stories Resource (if available in version)

#### Operations:
- **Send Story**
  - Parameters: media, caption, period, privacy, allowed_users, disallowed_users
  
- **Get Stories**
  - Parameters: chat_id
  
- **Get Pinned Stories**
  - Parameters: chat_id, offset_id, limit
  
- **Delete Stories**
  - Parameters: story_ids
  
- **Edit Story**
  - Parameters: story_id, media, caption, privacy

## Trigger Node Specifications

### Pyrogram Trigger Node
```typescript
{
  name: 'pyrogramTrigger',
  displayName: 'Pyrogram Trigger',
  description: 'Listen for Telegram updates via Pyrogram',
  group: ['trigger'],
  version: 1,
  defaults: {
    name: 'Pyrogram Trigger',
  },
  inputs: [],
  outputs: ['main'],
  credentials: [
    {
      name: 'pyrogramApi',
      required: true,
    },
  ],
  webhooks: [
    {
      name: 'default',
      httpMethod: 'POST',
      responseMode: 'onReceived',
      path: 'pyrogram',
    },
  ],
  properties: [
    {
      displayName: 'Update Types',
      name: 'updateTypes',
      type: 'multiOptions',
      options: [
        { name: 'Message', value: 'message' },
        { name: 'Edited Message', value: 'edited_message' },
        { name: 'Channel Post', value: 'channel_post' },
        { name: 'Edited Channel Post', value: 'edited_channel_post' },
        { name: 'Inline Query', value: 'inline_query' },
        { name: 'Callback Query', value: 'callback_query' },
        { name: 'Chosen Inline Result', value: 'chosen_inline_result' },
        { name: 'User Status', value: 'user_status' },
        { name: 'Poll', value: 'poll' },
        { name: 'Poll Answer', value: 'poll_answer' },
        { name: 'Chat Member', value: 'chat_member' },
        { name: 'Chat Join Request', value: 'chat_join_request' },
        { name: 'Deleted Messages', value: 'deleted_messages' },
        { name: 'User Typing', value: 'user_typing' },
        { name: 'Chat Action', value: 'chat_action' },
        { name: 'Reaction', value: 'reaction' },
        { name: 'Story', value: 'story' },
      ],
      default: ['message'],
      description: 'Select which update types to listen for',
    },
    {
      displayName: 'Filters',
      name: 'filters',
      type: 'collection',
      placeholder: 'Add Filter',
      default: {},
      options: [
        {
          displayName: 'Chat IDs',
          name: 'chatIds',
          type: 'string',
          default: '',
          description: 'Comma-separated list of chat IDs to filter',
        },
        {
          displayName: 'User IDs',
          name: 'userIds',
          type: 'string',
          default: '',
          description: 'Comma-separated list of user IDs to filter',
        },
        {
          displayName: 'Commands',
          name: 'commands',
          type: 'string',
          default: '',
          description: 'Comma-separated list of commands to filter (e.g., start, help)',
        },
        {
          displayName: 'Text Pattern',
          name: 'textPattern',
          type: 'string',
          default: '',
          description: 'Regex pattern to match message text',
        },
        {
          displayName: 'Media Types',
          name: 'mediaTypes',
          type: 'multiOptions',
          options: [
            { name: 'Photo', value: 'photo' },
            { name: 'Video', value: 'video' },
            { name: 'Audio', value: 'audio' },
            { name: 'Document', value: 'document' },
            { name: 'Sticker', value: 'sticker' },
            { name: 'Animation', value: 'animation' },
            { name: 'Voice', value: 'voice' },
            { name: 'Video Note', value: 'video_note' },
          ],
          default: [],
        },
      ],
    },
  ],
}
```

## Implementation Notes

### Backend Service Architecture
1. **Python Backend Service**
   - Implement a Python service using Pyrogram
   - Handle persistent sessions and authentication
   - Manage update handlers and webhooks
   - Process n8n node requests via REST API

2. **Session Management**
   - Store session strings securely
   - Handle multi-account scenarios
   - Implement session rotation and refresh

3. **Rate Limiting**
   - Implement Telegram API rate limit handling
   - Queue management for bulk operations
   - Automatic retry with exponential backoff

4. **Error Handling**
   - Comprehensive error codes mapping
   - Retry logic for network failures
   - Graceful degradation for API changes

### Node.js Integration Layer
1. **HTTP Client**
   - Communicate with Python backend
   - Handle authentication flow
   - Process responses and errors

2. **File Handling**
   - Support file uploads/downloads
   - Stream large files
   - Handle various media formats

3. **Webhook Management**
   - Register/unregister webhooks
   - Process incoming updates
   - Filter and route events

## Advanced Features

### Batch Operations
- Bulk message sending
- Batch user operations
- Parallel chat processing

### Scheduling
- Schedule messages
- Delayed actions
- Recurring tasks

### Analytics
- Message statistics
- User activity tracking
- Chat analytics

### File Management
- Upload progress tracking
- Resume interrupted uploads
- Automatic file compression

## Testing Requirements

1. **Unit Tests**
   - Test each operation independently
   - Mock Pyrogram responses
   - Validate parameter processing

2. **Integration Tests**
   - Test with real Telegram test server
   - Validate webhook functionality
   - Test rate limiting behavior

3. **End-to-End Tests**
   - Complete workflow testing
   - Multi-node chain testing
   - Error recovery scenarios

## Documentation Requirements

1. **User Documentation**
   - Setup guide with screenshots
   - Authentication tutorial
   - Common use cases examples

2. **API Documentation**
   - Complete parameter descriptions
   - Response format examples
   - Error code reference

3. **Developer Documentation**
   - Architecture overview
   - Contributing guidelines
   - Local development setup

## Security Considerations

1. **Credentials Storage**
   - Encrypt sensitive data
   - Use n8n credential system
   - Never log sensitive information

2. **Input Validation**
   - Sanitize all user inputs
   - Validate file uploads
   - Prevent injection attacks

3. **Access Control**
   - Implement proper scoping
   - Validate permissions
   - Audit logging

## Performance Optimization

1. **Caching**
   - Cache user/chat information
   - Store frequently used media
   - Implement TTL strategies

2. **Connection Pooling**
   - Reuse Pyrogram clients
   - Manage concurrent connections
   - Optimize resource usage

3. **Async Operations**
   - Non-blocking I/O
   - Parallel processing
   - Queue management

## Deployment Considerations

1. **Docker Support**
   - Containerized Python service
   - Environment configuration
   - Volume mounting for sessions

2. **Scaling**
   - Horizontal scaling support
   - Load balancing
   - Session distribution

3. **Monitoring**
   - Health checks
   - Performance metrics
   - Error tracking