import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow'

export const pyroTriggerDescription: INodeTypeDescription = {
	displayName: 'Pyro Trigger',
	name: 'pyroTrigger',
	icon: 'file:pyro.svg',
	group: ['trigger'],
	version: 1,
	description: 'Listen for Telegram events via Pyro FastAPI backend',
	defaults: {
		name: 'Pyro Trigger',
	},
	inputs: [],
	outputs: ['main' as NodeConnectionType],
	credentials: [
		{
			name: 'pyroApi',
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
					triggerType: ['polling'],
				},
			},
		},
	],
}