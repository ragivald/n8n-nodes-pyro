import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow'

export const nodeDescription: INodeTypeDescription = {
	displayName: 'Pyro',
	name: 'pyro',
	icon: 'file:pyro.svg',
	group: ['transform'],
	version: 1,
	description: 'Execute Telegram operations via Pyro FastAPI backend',
	defaults: {
		name: 'Pyro',
	},
	inputs: ['main' as NodeConnectionType],
	outputs: ['main' as NodeConnectionType],
	credentials: [
		{
			name: 'pyroApi',
			required: true,
		},
	],
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			options: [
				{ name: 'Messages2', value: 'messages' },
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
				{
					name: 'Send Audio',
					value: 'send_audio',
					description: 'Send an audio file',
				},
				{
					name: 'Send Document',
					value: 'send_document',
					description: 'Send a document',
				},
				{
					name: 'Send Voice',
					value: 'send_voice',
					description: 'Send a voice message',
				},
				{
					name: 'Send Video',
					value: 'send_video',
					description: 'Send a video',
				},
				{
					name: 'Send Video Note',
					value: 'send_video_note',
					description: 'Send a video note',
				},
				{
					name: 'Send Animation',
					value: 'send_animation',
					description: 'Send an animation',
				},
				{
					name: 'Send Sticker',
					value: 'send_sticker',
					description: 'Send a sticker',
				},
				{
					name: 'Send Location',
					value: 'send_location',
					description: 'Send a location',
				},
				{
					name: 'Send Venue',
					value: 'send_venue',
					description: 'Send a venue',
				},
				{
					name: 'Send Contact',
					value: 'send_contact',
					description: 'Send a contact',
				},
				{ name: 'Send Poll', value: 'send_poll', description: 'Send a poll' },
				{ name: 'Send Dice', value: 'send_dice', description: 'Send a dice' },
				{
					name: 'Forward Message',
					value: 'forward_message',
					description: 'Forward a message',
				},
				{
					name: 'Copy Message',
					value: 'copy_message',
					description: 'Copy a message',
				},
				{
					name: 'Edit Message Text',
					value: 'edit_message_text',
					description: 'Edit message text',
				},
				{
					name: 'Edit Message Caption',
					value: 'edit_message_caption',
					description: 'Edit message caption',
				},
				{
					name: 'Edit Message Media',
					value: 'edit_message_media',
					description: 'Edit message media',
				},
				{
					name: 'Delete Message',
					value: 'delete_message',
					description: 'Delete a message',
				},
				{
					name: 'Get Messages',
					value: 'get_messages',
					description: 'Get messages by ID',
				},
				{
					name: 'Get Message History',
					value: 'get_message_history',
					description: 'Get chat message history',
				},
				{
					name: 'Search Messages',
					value: 'search_messages',
					description: 'Search messages in chat',
				},
				{
					name: 'Download Media',
					value: 'download_media',
					description: 'Download media from message',
				},
			],
			default: 'send_message',
			displayOptions: {
				show: {
					resource: ['messages'],
				},
			},
		},
		// Chats operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{ name: 'Get Chat', value: 'get_chat', description: 'Get chat info' },
				{
					name: 'Get Chat Members',
					value: 'get_chat_members',
					description: 'Get chat members',
				},
				{
					name: 'Get Chat Member',
					value: 'get_chat_member',
					description: 'Get info about a chat member',
				},
				{
					name: 'Get Chat Administrators',
					value: 'get_chat_administrators',
					description: 'Get chat admins',
				},
				{ name: 'Leave Chat', value: 'leave_chat', description: 'Leave chat' },
				{
					name: 'Set Chat Title',
					value: 'set_chat_title',
					description: 'Set chat title',
				},
				{
					name: 'Set Chat Photo',
					value: 'set_chat_photo',
					description: 'Set chat photo',
				},
				{
					name: 'Delete Chat Photo',
					value: 'delete_chat_photo',
					description: 'Delete chat photo',
				},
			],
			default: 'get_chat',
			displayOptions: {
				show: {
					resource: ['chats'],
				},
			},
		},
		// Users operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Get Me',
					value: 'get_me',
					description: 'Get current user/bot info',
				},
				{
					name: 'Get Users',
					value: 'get_users',
					description: 'Get info about users',
				},
				{
					name: 'Get User Profile Photos',
					value: 'get_user_profile_photos',
					description: 'Get user profile photos',
				},
			],
			default: 'get_me',
			displayOptions: {
				show: {
					resource: ['users'],
				},
			},
		},
		// Contacts operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Get Contacts',
					value: 'get_contacts',
					description: 'Get contacts',
				},
				{
					name: 'Add Contact',
					value: 'add_contact',
					description: 'Add a contact',
				},
				{
					name: 'Delete Contacts',
					value: 'delete_contacts',
					description: 'Delete contacts',
				},
			],
			default: 'get_contacts',
			displayOptions: {
				show: {
					resource: ['contacts'],
				},
			},
		},
		// Bot operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Get Bot Commands',
					value: 'get_bot_commands',
					description: 'Get bot commands',
				},
				{
					name: 'Set Bot Commands',
					value: 'set_bot_commands',
					description: 'Set bot commands',
				},
				{
					name: 'Delete Bot Commands',
					value: 'delete_bot_commands',
					description: 'Delete bot commands',
				},
			],
			default: 'get_bot_commands',
			displayOptions: {
				show: {
					resource: ['bot'],
				},
			},
		},
		// Stories operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			options: [
				{
					name: 'Get Stories',
					value: 'get_stories',
					description: 'Get stories',
				},
			],
			default: 'get_stories',
			displayOptions: {
				show: {
					resource: ['stories'],
				},
			},
		},
		// Reactions operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			options: [
				{
					name: 'Get Reactions',
					value: 'get_reactions',
					description: 'Get reactions',
				},
			],
			default: 'get_reactions',
			displayOptions: {
				show: {
					resource: ['reactions'],
				},
			},
		},
		// Advanced operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Raw API',
					value: 'raw_api',
					description: 'Call any Pyrogram API method',
				},
				{
					name: 'Get Session String',
					value: 'get_session_string',
					description: 'Get Pyrogram session string (user or bot)',
				},
			],
			default: 'raw_api',
			displayOptions: {
				show: {
					resource: ['advanced'],
				},
			},
		},
		// Invite Links operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			default: 'get_chat_invite_link_info',
			options: [
				{
					name: 'Get Chat Invite Link Info',
					value: 'get_chat_invite_link_info',
					description: 'Get info about a chat invite link',
				},
				{
					name: 'Export Chat Invite Link',
					value: 'export_chat_invite_link',
					description: 'Export a chat invite link',
				},
				{
					name: 'Create Chat Invite Link',
					value: 'create_chat_invite_link',
					description: 'Create a new chat invite link',
				},
			],
			displayOptions: {
				show: {
					resource: ['invite_links'],
				},
			},
		},
		// Password operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Enable Cloud Password',
					value: 'enable_cloud_password',
					description: 'Enable cloud password',
				},
				{
					name: 'Change Cloud Password',
					value: 'change_cloud_password',
					description: 'Change cloud password',
				},
				{
					name: 'Remove Cloud Password',
					value: 'remove_cloud_password',
					description: 'Remove cloud password',
				},
			],
			default: 'enable_cloud_password',
			displayOptions: {
				show: {
					resource: ['password'],
				},
			},
		},
		// Utilities operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Set Parse Mode',
					value: 'set_parse_mode',
					description: 'Set parse mode',
				},
				{
					name: 'Compose',
					value: 'compose',
					description: 'Compose clients',
				},
			],
			default: 'set_parse_mode',
			displayOptions: {
				show: {
					resource: ['utilities'],
				},
			},
		},
		// Parameters for send_message
		{
			displayName: 'Chat ID',
			name: 'chat_id',
			type: 'string',
			required: true,
			default: '',
			description: 'Unique identifier for the target chat',
			displayOptions: {
				show: {
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
					resource: ['messages'],
					operation: ['send_message'],
				},
			},
		},
		// ... продовжити для всіх інших параметрів
	],
}
