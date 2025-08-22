import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow'

export const nodeDescription: INodeTypeDescription = {
	displayName: 'Pyro',
	name: 'pyro',
	icon: 'file:pyro.svg',
	group: ['trigger', 'transform'],
	version: 1,
	description: 'Interact with Pyro FastAPI backend',
	defaults: {
		name: 'Pyro',
	},
	// Важливо: вказати що нода підтримує тригери
	inputs: ['main'],
	outputs: ['main'],
	inputNames: ['main'],
	outputNames: ['main'],
	credentials: [
		{
			name: 'pyroApi',
			required: true,
		},
	],
	// Додати підтримку як тригера так і звичайної ноди
	polling: true,
	webhooks: [
		{
			name: 'default',
			httpMethod: 'POST',
			responseMode: 'onReceived',
			path: 'pyrogram-webhook',
		},
	],
	properties: [
		// Розділити на дві секції: Mode та операції
		{
			displayName: 'Mode',
			name: 'mode',
			type: 'options',
			options: [
				{
					name: 'Trigger',
					value: 'trigger',
					description: 'Listen for incoming events from Telegram',
				},
				{
					name: 'Execute',
					value: 'execute',
					description: 'Execute Telegram API operations',
				},
			],
			default: 'execute',
			description: 'Choose whether to use as trigger or execute operations',
		},
		// Trigger properties - показувати тільки в режимі trigger
		{
			displayName: 'Trigger Type',
			name: 'triggerType',
			type: 'options',
			options: [
				{ name: 'Message Handler', value: 'message' },
				{ name: 'Update Handler', value: 'update' },
				{ name: 'Polling', value: 'polling' },
			],
			default: 'message',
			description: 'Type of trigger to register on backend',
			displayOptions: {
				show: {
					mode: ['trigger'],
				},
			},
		},
		{
			displayName: 'Message Filters',
			name: 'messageFilters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			options: [
				{
					displayName: 'Chat Type',
					name: 'chatType',
					type: 'multiOptions',
					options: [
						{ name: 'Private', value: 'private' },
						{ name: 'Group', value: 'group' },
						{ name: 'Channel', value: 'channel' },
						{ name: 'Bot', value: 'bot' },
					],
					default: [],
				},
				{ displayName: 'Chat ID', name: 'chatId', type: 'string', default: '' },
				{
					displayName: 'User IDs (comma)',
					name: 'userIds',
					type: 'string',
					default: '',
				},
				{
					displayName: 'Text Pattern (Regex)',
					name: 'textPattern',
					type: 'string',
					default: '',
				},
				{
					displayName: 'Commands (comma)',
					name: 'commands',
					type: 'string',
					default: '',
				},
			],
			displayOptions: {
				show: {
					mode: ['trigger'],
					triggerType: ['message'],
				},
			},
		},
		{
			displayName: 'Update Handlers',
			name: 'updateHandlers',
			type: 'multiOptions',
			options: [
				{ name: 'Chat Member Updated', value: 'on_chat_member_updated' },
				{ name: 'Callback Query', value: 'on_callback_query' },
				{ name: 'Inline Query', value: 'on_inline_query' },
				{ name: 'Chosen Inline Result', value: 'on_chosen_inline_result' },
				{ name: 'User Status', value: 'on_user_status' },
				{ name: 'Poll', value: 'on_poll' },
				{ name: 'Poll Answer', value: 'on_poll_answer' },
				{ name: 'Chat Join Request', value: 'on_chat_join_request' },
			],
			default: ['on_callback_query'],
			displayOptions: {
				show: {
					mode: ['trigger'],
					triggerType: ['update'],
				},
			},
		},
		{
			displayName: 'Polling Method',
			name: 'pollingMethod',
			type: 'options',
			options: [{ name: 'Chat History', value: 'get_chat_history' }],
			default: 'get_chat_history',
			displayOptions: {
				show: {
					mode: ['trigger'],
					triggerType: ['polling'],
				},
			},
		},
		{
			displayName: 'Polling Interval (seconds)',
			name: 'pollingInterval',
			type: 'number',
			default: 60,
			description: 'Minimum 10 seconds',
			displayOptions: {
				show: {
					mode: ['trigger'],
					triggerType: ['polling'],
				},
			},
		},
		{
			displayName: 'Polling Config',
			name: 'pollingConfig',
			type: 'collection',
			default: {},
			options: [
				{ displayName: 'Chat ID', name: 'chatId', type: 'string', default: '' },
				{ displayName: 'Limit', name: 'limit', type: 'number', default: 100 },
				{
					displayName: 'Only New',
					name: 'onlyNew',
					type: 'boolean',
					default: true,
				},
			],
			displayOptions: {
				show: {
					mode: ['trigger'],
					triggerType: ['polling'],
				},
			},
		},

		// Execute mode properties
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			options: [
				{ name: 'Messages', value: 'messages' },
				{ name: 'Chats', value: 'chats' },
				{ name: 'Users', value: 'users' },
				{ name: 'Contacts', value: 'contacts' },
				{ name: 'Bot', value: 'bot' },
				{ name: 'Stories', value: 'stories' },
				{ name: 'Reactions', value: 'reactions' },
				{ name: 'Advanced', value: 'advanced' },
				{ name: 'Invite Links', value: 'invite_links' },
				{ name: 'Password', value: 'password' },
				{ name: 'Utilities', value: 'utilities' },
			],
			default: 'messages',
			description: 'Resource to operate on',
			displayOptions: {
				show: {
					mode: ['execute'],
				},
			},
		},
		// Всі інші операції також повинні мати displayOptions з mode: ['execute']
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Send Message',
					value: 'send_message',
					description: 'Send a text message',
				},
				{
					name: 'Send Photo',
					value: 'send_photo',
					description: 'Send a photo',
				},
				// ... інші операції messages
			],
			default: 'send_message',
			displayOptions: {
				show: {
					mode: ['execute'],
					resource: ['messages'],
				},
			},
		},
		// І так далі для всіх параметрів операцій...
		{
			displayName: 'Chat ID',
			name: 'chat_id',
			type: 'string',
			required: true,
			default: '',
			description: 'Unique identifier for the target chat',
			displayOptions: {
				show: {
					mode: ['execute'],
					resource: ['messages'],
					operation: ['send_message'],
				},
			},
		},
		{
			displayName: 'Text',
			name: 'text',
			type: 'string',
			required: true,
			default: '',
			description: 'Text of the message to be sent',
			displayOptions: {
				show: {
					mode: ['execute'],
					resource: ['messages'],
					operation: ['send_message'],
				},
			},
		},
		// ... продовжити для всіх інших параметрів
	],
}
