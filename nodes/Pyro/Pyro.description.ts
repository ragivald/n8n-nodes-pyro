import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow'

export const nodeDescription: INodeTypeDescription = {
	displayName: 'Pyro',
	name: 'pyro',
	icon: 'file:pyro.svg',
	group: ['transform'],
	version: 1,
	description: 'Interact with Pyro FastAPI backend',
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
				{ name: 'Messages', value: 'messages' },
				{ name: 'Chats', value: 'chats' },
				{ name: 'Users', value: 'users' },
				{ name: 'Contacts', value: 'contacts' },
				{ name: 'Bot', value: 'bot' },
				{ name: 'Stories', value: 'stories' },
				{ name: 'Reactions', value: 'reactions' },
				{ name: 'Advanced', value: 'advanced' },
			],
			default: 'messages',
			description: 'Resource to operate on',
		},
		// Messages operations
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
		{
			displayName: 'Parse Mode',
			name: 'parse_mode',
			type: 'options',
			options: [
				{ name: 'Markdown', value: 'Markdown' },
				{ name: 'HTML', value: 'HTML' },
				{ name: 'None', value: '' },
			],
			default: '',
			description: 'Mode for parsing entities in the message text',
			displayOptions: {
				show: {
					resource: ['messages'],
					operation: ['send_message'],
				},
			},
		},
		{
			displayName: 'Disable Notification',
			name: 'disable_notification',
			type: 'boolean',
			default: false,
			description: 'Sends the message silently',
			displayOptions: {
				show: {
					resource: ['messages'],
					operation: ['send_message'],
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
		// Parameters for chats operations
		{
			displayName: 'Chat ID',
			name: 'chat_id',
			type: 'string',
			required: true,
			default: '',
			description: 'Unique identifier for the target chat',
			displayOptions: {
				show: {
					resource: ['chats'],
					operation: [
						'get_chat',
						'get_chat_members',
						'get_chat_member',
						'get_chat_administrators',
						'leave_chat',
						'set_chat_title',
						'set_chat_photo',
						'delete_chat_photo',
					],
				},
			},
		},
		{
			displayName: 'User ID',
			name: 'user_id',
			type: 'string',
			default: '',
			description: 'User ID (for get_chat_member)',
			displayOptions: {
				show: {
					resource: ['chats'],
					operation: ['get_chat_member'],
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 10,
			description: 'Limit for get_chat_members',
			displayOptions: {
				show: {
					resource: ['chats'],
					operation: ['get_chat_members'],
				},
			},
		},
		{
			displayName: 'Offset',
			name: 'offset',
			type: 'number',
			default: 0,
			description: 'Offset for get_chat_members',
			displayOptions: {
				show: {
					resource: ['chats'],
					operation: ['get_chat_members'],
				},
			},
		},
		{
			displayName: 'Title',
			name: 'title',
			type: 'string',
			default: '',
			description: 'New chat title',
			displayOptions: {
				show: {
					resource: ['chats'],
					operation: ['set_chat_title'],
				},
			},
		},
		{
			displayName: 'Photo',
			name: 'photo',
			type: 'string',
			default: '',
			description: 'Photo file path, URL, or file_id',
			displayOptions: {
				show: {
					resource: ['chats'],
					operation: ['set_chat_photo'],
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
		{
			displayName: 'User IDs',
			name: 'user_ids',
			type: 'string',
			default: '',
			description: 'Comma-separated list of user IDs (for get_users)',
			displayOptions: {
				show: {
					resource: ['users'],
					operation: ['get_users'],
				},
			},
		},
		{
			displayName: 'User ID',
			name: 'user_id',
			type: 'string',
			default: '',
			description: 'User ID (for get_user_profile_photos)',
			displayOptions: {
				show: {
					resource: ['users'],
					operation: ['get_user_profile_photos'],
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 10,
			description: 'Limit for get_user_profile_photos',
			displayOptions: {
				show: {
					resource: ['users'],
					operation: ['get_user_profile_photos'],
				},
			},
		},
		{
			displayName: 'Offset',
			name: 'offset',
			type: 'number',
			default: 0,
			description: 'Offset for get_user_profile_photos',
			displayOptions: {
				show: {
					resource: ['users'],
					operation: ['get_user_profile_photos'],
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
		{
			displayName: 'Phone Number',
			name: 'phone_number',
			type: 'string',
			default: '',
			description: 'Phone number (for add_contact)',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['add_contact'],
				},
			},
		},
		{
			displayName: 'First Name',
			name: 'first_name',
			type: 'string',
			default: '',
			description: 'First name (for add_contact)',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['add_contact'],
				},
			},
		},
		{
			displayName: 'Last Name',
			name: 'last_name',
			type: 'string',
			default: '',
			description: 'Last name (for add_contact)',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['add_contact'],
				},
			},
		},
		{
			displayName: 'User ID',
			name: 'user_id',
			type: 'string',
			default: '',
			description: 'User ID (for add_contact)',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['add_contact'],
				},
			},
		},
		{
			displayName: 'User IDs',
			name: 'user_ids',
			type: 'string',
			default: '',
			description: 'Comma-separated list of user IDs (for delete_contacts)',
			displayOptions: {
				show: {
					resource: ['contacts'],
					operation: ['delete_contacts'],
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
			],
			default: 'raw_api',
			displayOptions: {
				show: {
					resource: ['advanced'],
				},
			},
		},
		{
			displayName: 'Method',
			name: 'method',
			type: 'string',
			default: '',
			description: 'Pyrogram API method name',
			displayOptions: {
				show: {
					resource: ['advanced'],
					operation: ['raw_api'],
				},
			},
		},
		{
			displayName: 'Params',
			name: 'params',
			type: 'json',
			default: '{}',
			description: 'Parameters for the API method as JSON',
			displayOptions: {
				show: {
					resource: ['advanced'],
					operation: ['raw_api'],
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
		// Далі для кожної операції додаються свої параметри (буде додано поступово)
	],
}
