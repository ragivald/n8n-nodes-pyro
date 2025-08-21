# Technical Specification: Adding Pyrogram Triggers to n8n Custom Node

## Overview

Extend the existing n8n custom node to support Telegram/MTProto triggers using Pyrogram library. The implementation should support three trigger types: Message Handlers (event-based), Update Handlers (various events), and Polling Methods (interval-based).

## Architecture Requirements

### Base Trigger Class Structure

```typescript
interface PyrogramTriggerOptions {
	triggerType: 'message' | 'update' | 'polling'
	authentication: {
		apiId: string
		apiHash: string
		sessionString?: string
		phoneNumber?: string
	}
	filterOptions?: object
	pollingInterval?: number // in seconds, for polling type
	webhookUrl?: string // for event-based triggers
}
```

## 1. Message Handlers (Event-based) Implementation

### Technical Requirements

- Implement real-time message listening using Pyrogram's decorator patterns
- Support multiple message filter types
- Maintain persistent connection to Telegram servers
- Handle reconnection logic automatically

### Node Configuration Fields

```typescript
{
  name: 'messageHandler',
  displayName: 'Message Handler',
  type: 'options',
  options: [
    {
      name: 'New Message',
      value: 'on_message',
      description: 'Trigger on new messages'
    },
    {
      name: 'Edited Message',
      value: 'on_edited_message',
      description: 'Trigger on edited messages'
    },
    {
      name: 'Deleted Message',
      value: 'on_deleted_messages',
      description: 'Trigger on deleted messages'
    }
  ],
  default: 'on_message'
}
```

### Filter Configuration

```typescript
{
  name: 'messageFilters',
  displayName: 'Message Filters',
  type: 'collection',
  placeholder: 'Add Filter',
  default: {},
  options: [
    {
      name: 'chatType',
      displayName: 'Chat Type',
      type: 'multiOptions',
      options: [
        { name: 'Private', value: 'private' },
        { name: 'Group', value: 'group' },
        { name: 'Channel', value: 'channel' },
        { name: 'Bot', value: 'bot' }
      ]
    },
    {
      name: 'chatId',
      displayName: 'Chat ID',
      type: 'string',
      default: '',
      description: 'Specific chat/channel ID to monitor'
    },
    {
      name: 'userIds',
      displayName: 'User IDs',
      type: 'string',
      default: '',
      description: 'Comma-separated user IDs to filter'
    },
    {
      name: 'textPattern',
      displayName: 'Text Pattern (Regex)',
      type: 'string',
      default: '',
      description: 'Regular expression to match message text'
    },
    {
      name: 'commands',
      displayName: 'Commands',
      type: 'string',
      default: '',
      description: 'Comma-separated bot commands (e.g., /start, /help)'
    }
  ]
}
```

### Implementation Logic

```python
# Python backend service
class MessageHandlerTrigger:
    def __init__(self, n8n_webhook_url, filters_config):
        self.webhook_url = n8n_webhook_url
        self.filters = self.build_filters(filters_config)

    def build_filters(self, config):
        filter_obj = filters.all
        if config.get('chatType'):
            filter_obj &= getattr(filters, config['chatType'])
        if config.get('chatId'):
            filter_obj &= filters.chat(config['chatId'])
        if config.get('textPattern'):
            filter_obj &= filters.regex(config['textPattern'])
        return filter_obj

    async def register_handlers(self, app):
        @app.on_message(self.filters)
        async def message_trigger(client, message):
            payload = {
                'triggerType': 'message',
                'messageId': message.id,
                'text': message.text or message.caption,
                'chatId': message.chat.id,
                'chatType': message.chat.type,
                'userId': message.from_user.id if message.from_user else None,
                'userName': message.from_user.username if message.from_user else None,
                'date': message.date.isoformat(),
                'mediaType': message.media if message.media else None,
                'replyToMessageId': message.reply_to_message_id
            }
            await self.send_to_n8n(payload)
```

## 2. Update Handlers (Various Events) Implementation

### Technical Requirements

- Support multiple update types simultaneously
- Provide granular event data for each update type
- Handle rate limiting and throttling
- Support event filtering and conditions

### Node Configuration Fields

```typescript
{
  name: 'updateHandlers',
  displayName: 'Update Events',
  type: 'multiOptions',
  options: [
    {
      name: 'Chat Member Updated',
      value: 'on_chat_member_updated',
      description: 'Member join/leave/promote events'
    },
    {
      name: 'Callback Query',
      value: 'on_callback_query',
      description: 'Inline keyboard button clicks'
    },
    {
      name: 'Inline Query',
      value: 'on_inline_query',
      description: 'Inline bot queries'
    },
    {
      name: 'Chosen Inline Result',
      value: 'on_chosen_inline_result',
      description: 'User selected inline result'
    },
    {
      name: 'User Status',
      value: 'on_user_status',
      description: 'User online/offline status changes'
    },
    {
      name: 'Poll',
      value: 'on_poll',
      description: 'Poll updates'
    },
    {
      name: 'Poll Answer',
      value: 'on_poll_answer',
      description: 'Poll vote updates'
    },
    {
      name: 'Chat Join Request',
      value: 'on_chat_join_request',
      description: 'Join requests for private chats/channels'
    }
  ],
  default: ['on_callback_query']
}
```

### Implementation Logic

```python
class UpdateHandlerTrigger:
    def __init__(self, n8n_webhook_url, selected_handlers):
        self.webhook_url = n8n_webhook_url
        self.selected_handlers = selected_handlers

    async def register_handlers(self, app):
        if 'on_chat_member_updated' in self.selected_handlers:
            @app.on_chat_member_updated()
            async def member_update(client, chat_member_updated):
                payload = {
                    'triggerType': 'chat_member_updated',
                    'chatId': chat_member_updated.chat.id,
                    'userId': chat_member_updated.new_chat_member.user.id,
                    'oldStatus': chat_member_updated.old_chat_member.status,
                    'newStatus': chat_member_updated.new_chat_member.status,
                    'inviteLink': chat_member_updated.invite_link,
                    'date': chat_member_updated.date.isoformat()
                }
                await self.send_to_n8n(payload)

        if 'on_callback_query' in self.selected_handlers:
            @app.on_callback_query()
            async def callback_query(client, callback_query):
                payload = {
                    'triggerType': 'callback_query',
                    'queryId': callback_query.id,
                    'userId': callback_query.from_user.id,
                    'data': callback_query.data,
                    'messageId': callback_query.message.id if callback_query.message else None,
                    'chatId': callback_query.message.chat.id if callback_query.message else None,
                    'inlineMessageId': callback_query.inline_message_id
                }
                await self.send_to_n8n(payload)
```

## 3. Polling Methods (Interval-based) Implementation

### Technical Requirements

- Implement efficient polling with configurable intervals
- Store state between polls (last message ID, timestamps)
- Support pagination for large result sets
- Implement backoff strategies for rate limiting
- Provide delta detection (only new/changed items)

### Node Configuration Fields

```typescript
{
  name: 'pollingMethod',
  displayName: 'Polling Method',
  type: 'options',
  options: [
    {
      name: 'Chat History',
      value: 'get_chat_history',
      description: 'Poll for new messages in chat'
    },
    {
      name: 'Dialogs',
      value: 'get_dialogs',
      description: 'Poll for new conversations'
    },
    {
      name: 'Chat Members',
      value: 'get_chat_members',
      description: 'Poll for member changes'
    },
    {
      name: 'Chat Members Count',
      value: 'get_chat_members_count',
      description: 'Poll for member count changes'
    },
    {
      name: 'Search Messages',
      value: 'search_messages',
      description: 'Poll for messages matching criteria'
    }
  ],
  default: 'get_chat_history'
}

{
  name: 'pollingInterval',
  displayName: 'Polling Interval (seconds)',
  type: 'number',
  default: 60,
  description: 'How often to check for updates (minimum 10 seconds)'
}

{
  name: 'pollingConfig',
  displayName: 'Polling Configuration',
  type: 'collection',
  default: {},
  options: [
    {
      name: 'chatId',
      displayName: 'Chat ID',
      type: 'string',
      required: true,
      description: 'Chat/Channel ID to poll'
    },
    {
      name: 'limit',
      displayName: 'Limit',
      type: 'number',
      default: 100,
      description: 'Maximum items per poll'
    },
    {
      name: 'searchQuery',
      displayName: 'Search Query',
      type: 'string',
      default: '',
      description: 'For search_messages method'
    },
    {
      name: 'onlyNew',
      displayName: 'Only New Items',
      type: 'boolean',
      default: true,
      description: 'Only trigger for new items since last poll'
    }
  ]
}
```

### State Management

```typescript
interface PollingState {
	lastMessageId?: number
	lastPollTimestamp?: number
	lastMemberCount?: number
	processedIds: Set<string>
	errorCount: number
	backoffMultiplier: number
}
```

### Implementation Logic

```python
class PollingMethodTrigger:
    def __init__(self, n8n_webhook_url, method, config):
        self.webhook_url = n8n_webhook_url
        self.method = method
        self.config = config
        self.state = self.load_state()

    async def poll_chat_history(self, app):
        try:
            messages = []
            async for message in app.get_chat_history(
                self.config['chatId'],
                limit=self.config['limit'],
                offset_id=self.state.get('lastMessageId', 0)
            ):
                if self.config['onlyNew'] and message.id <= self.state.get('lastMessageId', 0):
                    break
                messages.append(message)

            if messages:
                self.state['lastMessageId'] = messages[0].id
                payload = {
                    'triggerType': 'polling_chat_history',
                    'chatId': self.config['chatId'],
                    'newMessages': [
                        {
                            'messageId': m.id,
                            'text': m.text or m.caption,
                            'userId': m.from_user.id if m.from_user else None,
                            'date': m.date.isoformat()
                        } for m in messages
                    ],
                    'count': len(messages),
                    'timestamp': datetime.now().isoformat()
                }
                await self.send_to_n8n(payload)
                self.save_state()

        except FloodWait as e:
            # Handle rate limiting with exponential backoff
            await asyncio.sleep(e.value * self.state['backoffMultiplier'])
            self.state['backoffMultiplier'] = min(self.state['backoffMultiplier'] * 2, 64)
```

## Integration with n8n Node

### Node Structure

```typescript
export class PyrogramTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pyrogram Trigger',
		name: 'pyrogramTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Trigger workflows from Telegram events using Pyrogram',
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
				path: 'pyrogram-webhook',
			},
		],
		properties: [
			// Add all configuration fields here
		],
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData()
		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		}
	}

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const triggerType = this.getNodeParameter('triggerType') as string
		const webhookUrl = this.getNodeWebhookUrl('default')

		// Initialize Python backend service with webhook URL
		// Handle connection lifecycle
		// Return appropriate trigger response
	}
}
```

## Python Backend Service

### Service Architecture

```python
# pyrogram_service.py
import asyncio
from pyrogram import Client
from typing import Dict, List, Any
import aiohttp
import json

class PyrogramTriggerService:
    def __init__(self, api_id: str, api_hash: str, session_string: str = None):
        self.app = Client(
            "n8n_session",
            api_id=api_id,
            api_hash=api_hash,
            session_string=session_string
        )
        self.active_triggers: Dict[str, Any] = {}
        self.polling_tasks: List[asyncio.Task] = []

    async def start(self):
        await self.app.start()

    async def stop(self):
        for task in self.polling_tasks:
            task.cancel()
        await self.app.stop()

    async def add_trigger(self, trigger_id: str, config: Dict[str, Any]):
        trigger_type = config['triggerType']

        if trigger_type == 'message':
            handler = MessageHandlerTrigger(config['webhookUrl'], config['filters'])
            await handler.register_handlers(self.app)

        elif trigger_type == 'update':
            handler = UpdateHandlerTrigger(config['webhookUrl'], config['handlers'])
            await handler.register_handlers(self.app)

        elif trigger_type == 'polling':
            handler = PollingMethodTrigger(config['webhookUrl'], config['method'], config['config'])
            task = asyncio.create_task(self.run_polling(handler))
            self.polling_tasks.append(task)

        self.active_triggers[trigger_id] = handler

    async def run_polling(self, handler: PollingMethodTrigger):
        while True:
            try:
                await handler.poll(self.app)
                await asyncio.sleep(handler.config['pollingInterval'])
            except Exception as e:
                # Log error and continue
                await asyncio.sleep(60)  # Default fallback interval
```

## Deployment Considerations

### Container Setup

```dockerfile
FROM node:18-alpine AS n8n-base
RUN apk add --no-cache python3 py3-pip
RUN pip3 install pyrogram tgcrypto aiohttp

# Copy custom node files
COPY ./nodes/PyrogramTrigger /usr/local/lib/node_modules/n8n/nodes/PyrogramTrigger

# Copy Python service
COPY ./services/pyrogram_service.py /opt/pyrogram/
```

### Environment Variables

```env
PYROGRAM_API_ID=your_api_id
PYROGRAM_API_HASH=your_api_hash
PYROGRAM_SESSION_STRING=optional_session_string
PYROGRAM_SERVICE_PORT=8081
N8N_WEBHOOK_BASE_URL=http://localhost:5678
```

## Error Handling & Monitoring

### Required Error Handling

1. **Connection Errors**: Automatic reconnection with exponential backoff
2. **Rate Limiting**: Handle FloodWait exceptions with appropriate delays
3. **Authentication Errors**: Clear error messages and re-authentication flow
4. **Webhook Failures**: Retry logic with dead letter queue
5. **State Persistence**: Regular state checkpointing for polling methods

### Monitoring Metrics

- Active trigger count
- Messages/events processed per minute
- Average processing latency
- Error rate by type
- Webhook delivery success rate
- Polling interval adherence

## Testing Requirements

### Unit Tests

```python
# test_triggers.py
import pytest
from unittest.mock import Mock, patch

class TestMessageHandler:
    def test_filter_building(self):
        config = {'chatType': 'private', 'textPattern': '^/start'}
        handler = MessageHandlerTrigger('http://webhook', config)
        assert handler.filters is not None

    async def test_message_processing(self):
        # Mock message object
        # Test payload generation
        # Verify webhook call
```

### Integration Tests

1. Test real Telegram connection with test account
2. Verify all trigger types fire correctly
3. Test state persistence across restarts
4. Validate webhook payload structure
5. Test error recovery scenarios

## Security Considerations

1. **Session Management**: Secure storage of session strings
2. **API Credentials**: Encrypted credential storage in n8n
3. **Webhook Authentication**: Implement webhook signature verification
4. **Rate Limiting**: Implement internal rate limiting to prevent abuse
5. **Data Privacy**: Option to exclude sensitive data from webhook payloads
6. **Access Control**: Validate chat/channel access permissions

## Performance Optimization

1. **Connection Pooling**: Reuse Pyrogram client instances
2. **Batch Processing**: Group multiple events in single webhook call
3. **Caching**: Cache frequently accessed data (user info, chat metadata)
4. **Async Processing**: Fully async implementation for all operations
5. **Resource Limits**: Configure max concurrent handlers and polling tasks

## Additional Implementation Tasks (integration to this repo)

This section maps the trigger specification to concrete tasks for the existing repository and lists minimal endpoints/files to add so triggers work with the current custom node and backend.

- Backend (backend/app.py)

  - Add trigger management endpoints: POST /triggers/add, POST /triggers/remove, POST /triggers/start, POST /triggers/stop, GET /triggers/list.
  - Endpoints accept JSON with trigger configuration (type, filters, polling config, webhook URL, credentials) and return trigger_id or status.
  - Implement state persistence for polling triggers (file or simple DB) and ability to restore state on service restart.
  - Implement secure webhook relay: sign outgoing webhooks or validate inbound calls from n8n.

- Python Pyrogram service (new file: backend/pyrogram_service.py or services/pyrogram_service.py)

  - Provide an async service class (PyrogramTriggerService) that manages a Client, registers handlers dynamically and runs polling tasks.
  - Methods: start(), stop(), add_trigger(trigger_id, config), remove_trigger(trigger_id), list_triggers().
  - Use aiohttp to POST payloads to n8n webhook URL configured by trigger.
  - Handle FloodWait, reconnection with exponential backoff, and graceful cancellation of polling tasks.

- n8n node (new node in nodes/Pyro or nodes/PyrogramTrigger)

  - Add a trigger-type node (PyrogramTrigger) implementing webhook, trigger, and lifecycle methods per spec.
  - Node must call backend endpoints to register/unregister triggers using credentials.baseUrl + /triggers/\* endpoints.
  - Implement UI fields (triggerType, filters, pollingInterval, pollingConfig, updateHandlers) matching the spec and description typings in Pyro.description.ts.

- Integrations in existing files

  - Expand backend/app.py to include the trigger endpoints above and a thin wrapper around pyrogram_service.
  - Add invocation points from Pyro.node.ts (or new trigger node) to call these endpoints for adding/removing triggers.

- Docker / requirements

  - Update backend/requirements.txt (add aiohttp if missing) and Dockerfile to include the Python service and necessary dependencies (pyrogram, tgcrypto, aiohttp).
  - Ensure Dockerfile copies services and exposes service port if used directly.

- Security & state

  - Store session strings and credentials securely in n8n credentials (existing PyroApi credential schema is OK; ensure node sends only necessary fields to backend).
  - Implement webhook signature or token to prevent unauthorized posts to n8n webhooks.
  - Persist polling state (lastMessageId, lastPollTimestamp) to disk or simple DB (sqlite) to survive restarts.

- Tests

  - Add unit tests for filter building, handler registration and webhook payload generation (tests/test_triggers.py), and integration tests that mock pyrogram.Client.

- CI / Lint
  - Ensure TypeScript node compiles and lints; ensure backend Python lints and requirements are pinned.

These tasks provide a clear roadmap to implement triggers from the spec and to integrate them with the current repository layout (backend/app.py and nodes/Pyro).

<!-- End of additional implementation tasks -->
