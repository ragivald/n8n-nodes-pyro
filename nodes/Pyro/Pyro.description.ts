import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow'

export const nodeDescription: INodeTypeDescription = {
	displayName: 'Pyrogram',
	name: 'pyrogram',
	icon: 'file:pyrogram.svg',
	group: ['transform'],
	version: 1,
	description: 'Interact with Telegram using Pyrogram MTProto API',
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	defaults: {
		name: 'Pyrogram',
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
				{ name: 'Invite Links', value: 'invite_links' },
				{ name: 'Password', value: 'password' },
				{ name: 'Bot', value: 'bot' },
				{ name: 'Utilities', value: 'utilities' },
				{ name: 'Advanced', value: 'advanced' },
				{ name: 'Stories', value: 'stories' },
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
					name: 'Send Video',
					value: 'send_video',
					description: 'Send a video',
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
				{
					name: 'Send Poll',
					value: 'send_poll',
					description: 'Send a poll',
				},
				{
					name: 'Send Dice',
					value: 'send_dice',
					description: 'Send a dice',
				},
				{
					name: 'Send Media Group',
					value: 'send_media_group',
					description: 'Send multiple photos/videos as an album',
				},
				{
					name: 'Forward Messages',
					value: 'forward_messages',
					description: 'Forward messages',
				},
				{
					name: 'Copy Messages',
					value: 'copy_messages',
					description: 'Copy messages',
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
					name: 'Delete Messages',
					value: 'delete_messages',
					description: 'Delete messages',
				},
				{
					name: 'Get Messages',
					value: 'get_messages',
					description: 'Get messages by ID',
				},
				{
					name: 'Get Chat History',
					value: 'get_chat_history',
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
				{
					name: 'Send Chat Action',
					value: 'send_chat_action',
					description: 'Send typing/uploading action',
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
				{ name: 'Join Chat', value: 'join_chat', description: 'Join a chat' },
				{
					name: 'Leave Chat',
					value: 'leave_chat',
					description: 'Leave a chat',
				},
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
					name: 'Ban Chat Member',
					value: 'ban_chat_member',
					description: 'Ban a chat member',
				},
				{
					name: 'Unban Chat Member',
					value: 'unban_chat_member',
					description: 'Unban a chat member',
				},
				{
					name: 'Restrict Chat Member',
					value: 'restrict_chat_member',
					description: 'Restrict a chat member',
				},
				{
					name: 'Promote Chat Member',
					value: 'promote_chat_member',
					description: 'Promote a chat member',
				},
				{
					name: 'Set Chat Title',
					value: 'set_chat_title',
					description: 'Set chat title',
				},
				{
					name: 'Set Chat Description',
					value: 'set_chat_description',
					description: 'Set chat description',
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
				{
					name: 'Pin Chat Message',
					value: 'pin_chat_message',
					description: 'Pin a message in chat',
				},
				{
					name: 'Unpin Chat Message',
					value: 'unpin_chat_message',
					description: 'Unpin a message in chat',
				},
				{
					name: 'Create Group',
					value: 'create_group',
					description: 'Create a group',
				},
				{
					name: 'Create Channel',
					value: 'create_channel',
					description: 'Create a channel',
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
					name: 'Get Chat Photos',
					value: 'get_chat_photos',
					description: 'Get user profile photos',
				},
				{
					name: 'Set Profile Photo',
					value: 'set_profile_photo',
					description: 'Set profile photo',
				},
				{
					name: 'Delete Profile Photos',
					value: 'delete_profile_photos',
					description: 'Delete profile photos',
				},
				{
					name: 'Update Profile',
					value: 'update_profile',
					description: 'Update profile information',
				},
				{
					name: 'Block User',
					value: 'block_user',
					description: 'Block a user',
				},
				{
					name: 'Unblock User',
					value: 'unblock_user',
					description: 'Unblock a user',
				},
			],
			default: 'get_me',
			displayOptions: {
				show: {
					resource: ['users'],
				},
			},
		},
		// Contact operations
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
				{
					name: 'Import Contacts',
					value: 'import_contacts',
					description: 'Import contacts',
				},
			],
			default: 'get_contacts',
			displayOptions: {
				show: {
					resource: ['contacts'],
				},
			},
		},
		// Invite Links operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
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
				{
					name: 'Edit Chat Invite Link',
					value: 'edit_chat_invite_link',
					description: 'Edit a chat invite link',
				},
				{
					name: 'Revoke Chat Invite Link',
					value: 'revoke_chat_invite_link',
					description: 'Revoke a chat invite link',
				},
			],
			default: 'get_chat_invite_link_info',
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
		// Bot operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Set Bot Commands',
					value: 'set_bot_commands',
					description: 'Set bot commands',
				},
				{
					name: 'Get Bot Commands',
					value: 'get_bot_commands',
					description: 'Get bot commands',
				},
				{
					name: 'Delete Bot Commands',
					value: 'delete_bot_commands',
					description: 'Delete bot commands',
				},
				{
					name: 'Answer Callback Query',
					value: 'answer_callback_query',
					description: 'Answer callback query',
				},
				{
					name: 'Answer Inline Query',
					value: 'answer_inline_query',
					description: 'Answer inline query',
				},
			],
			default: 'get_bot_commands',
			displayOptions: {
				show: {
					resource: ['bot'],
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
					name: 'Start',
					value: 'start',
					description: 'Start the client',
				},
				{
					name: 'Stop',
					value: 'stop',
					description: 'Stop the client',
				},
				{
					name: 'Export Session String',
					value: 'export_session_string',
					description: 'Export current session as string',
				},
				{
					name: 'Set Parse Mode',
					value: 'set_parse_mode',
					description: 'Set parse mode',
				},
			],
			default: 'start',
			displayOptions: {
				show: {
					resource: ['utilities'],
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
					name: 'Invoke',
					value: 'invoke',
					description: 'Execute raw MTProto API functions',
				},
				{
					name: 'Resolve Peer',
					value: 'resolve_peer',
					description: 'Get InputPeer from known peer ID',
				},
				{
					name: 'Save File',
					value: 'save_file',
					description: 'Upload file to Telegram servers',
				},
			],
			default: 'invoke',
			displayOptions: {
				show: {
					resource: ['advanced'],
				},
			},
		},
		// Stories operations
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Send Story',
					value: 'send_story',
					description: 'Send a story',
				},
				{
					name: 'Get Stories',
					value: 'get_stories',
					description: 'Get stories',
				},
				{
					name: 'Delete Stories',
					value: 'delete_stories',
					description: 'Delete stories',
				},
			],
			default: 'get_stories',
			displayOptions: {
				show: {
					resource: ['stories'],
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
				{ name: 'Markdown', value: 'markdown' },
				{ name: 'HTML', value: 'html' },
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
		{
			displayName: 'Disable Web Page Preview',
			name: 'disable_web_page_preview',
			type: 'boolean',
			default: false,
			description: 'Disables link previews for links in this message',
			displayOptions: {
				show: {
					resource: ['messages'],
					operation: ['send_message'],
				},
			},
		},
		{
			displayName: 'Reply to Message ID',
			name: 'reply_to_message_id',
			type: 'number',
			default: 0,
			description: 'ID of the original message you want to reply to',
			displayOptions: {
				show: {
					resource: ['messages'],
					operation: ['send_message'],
				},
			},
		},
	],
}
