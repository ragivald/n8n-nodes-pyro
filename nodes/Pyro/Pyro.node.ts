import { IHttpRequestMethods } from 'n8n-workflow'
// n8n-nodes-pyro/nodes/Pyro/Pyro.node.ts
import { IExecuteFunctions } from 'n8n-workflow'
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow'
import { nodeDescription } from './Pyro.description'

export class Pyro implements INodeType {
	description: INodeTypeDescription = nodeDescription

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		const returnData: INodeExecutionData[] = []
		const credentials = await this.getCredentials('pyroApi')
		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string
			const operation = this.getNodeParameter('operation', i) as string
			let endpoint = ''
			let method = 'POST'
			let body: any = {}

			if (resource === 'messages') {
				switch (operation) {
					case 'send_message':
						endpoint = '/send_message'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							text: this.getNodeParameter('text', i),
							parse_mode: this.getNodeParameter('parse_mode', i),
							disable_notification: this.getNodeParameter(
								'disable_notification',
								i
							),
						}
						break
					case 'send_photo':
						endpoint = '/send_photo'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							photo: this.getNodeParameter('photo', i),
							caption: this.getNodeParameter('caption', i, ''),
							parse_mode: this.getNodeParameter('parse_mode', i, ''),
							ttl_seconds: this.getNodeParameter('ttl_seconds', i, undefined),
						}
						break
					case 'send_audio':
						endpoint = '/send_audio'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							audio: this.getNodeParameter('audio', i),
							caption: this.getNodeParameter('caption', i, ''),
							duration: this.getNodeParameter('duration', i, undefined),
							performer: this.getNodeParameter('performer', i, ''),
							title: this.getNodeParameter('title', i, ''),
						}
						break
					case 'send_document':
						endpoint = '/send_document'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							document: this.getNodeParameter('document', i),
							caption: this.getNodeParameter('caption', i, ''),
							parse_mode: this.getNodeParameter('parse_mode', i, ''),
							file_name: this.getNodeParameter('file_name', i, ''),
						}
						break
					case 'send_voice':
						endpoint = '/send_voice'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							voice: this.getNodeParameter('voice', i),
							caption: this.getNodeParameter('caption', i, ''),
							duration: this.getNodeParameter('duration', i, undefined),
						}
						break
					case 'send_video':
						endpoint = '/send_video'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							video: this.getNodeParameter('video', i),
							caption: this.getNodeParameter('caption', i, ''),
							duration: this.getNodeParameter('duration', i, undefined),
							width: this.getNodeParameter('width', i, undefined),
							height: this.getNodeParameter('height', i, undefined),
							thumb: this.getNodeParameter('thumb', i, ''),
							supports_streaming: this.getNodeParameter(
								'supports_streaming',
								i,
								undefined
							),
						}
						break
					case 'send_video_note':
						endpoint = '/send_video_note'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							video_note: this.getNodeParameter('video_note', i),
							duration: this.getNodeParameter('duration', i, undefined),
							length: this.getNodeParameter('length', i, undefined),
							thumb: this.getNodeParameter('thumb', i, ''),
						}
						break
					case 'send_animation':
						endpoint = '/send_animation'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							animation: this.getNodeParameter('animation', i),
							caption: this.getNodeParameter('caption', i, ''),
							duration: this.getNodeParameter('duration', i, undefined),
							width: this.getNodeParameter('width', i, undefined),
							height: this.getNodeParameter('height', i, undefined),
						}
						break
					case 'send_sticker':
						endpoint = '/send_sticker'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							sticker: this.getNodeParameter('sticker', i),
							emoji: this.getNodeParameter('emoji', i, ''),
							disable_notification: this.getNodeParameter(
								'disable_notification',
								i,
								false
							),
						}
						break
					case 'send_location':
						endpoint = '/send_location'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							latitude: this.getNodeParameter('latitude', i),
							longitude: this.getNodeParameter('longitude', i),
							live_period: this.getNodeParameter('live_period', i, undefined),
							heading: this.getNodeParameter('heading', i, undefined),
							proximity_alert_radius: this.getNodeParameter(
								'proximity_alert_radius',
								i,
								undefined
							),
						}
						break
					case 'send_venue':
						endpoint = '/send_venue'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							latitude: this.getNodeParameter('latitude', i),
							longitude: this.getNodeParameter('longitude', i),
							title: this.getNodeParameter('title', i),
							address: this.getNodeParameter('address', i),
							foursquare_id: this.getNodeParameter('foursquare_id', i, ''),
							foursquare_type: this.getNodeParameter('foursquare_type', i, ''),
							google_place_id: this.getNodeParameter('google_place_id', i, ''),
							google_place_type: this.getNodeParameter(
								'google_place_type',
								i,
								''
							),
						}
						break
					case 'send_contact':
						endpoint = '/send_contact'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							phone_number: this.getNodeParameter('phone_number', i),
							first_name: this.getNodeParameter('first_name', i),
							last_name: this.getNodeParameter('last_name', i, ''),
							vcard: this.getNodeParameter('vcard', i, ''),
						}
						break
					case 'send_poll':
						endpoint = '/send_poll'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							question: this.getNodeParameter('question', i),
							options: this.getNodeParameter('options', i),
							is_anonymous: this.getNodeParameter('is_anonymous', i, true),
							type: this.getNodeParameter('type', i, 'regular'),
							allows_multiple_answers: this.getNodeParameter(
								'allows_multiple_answers',
								i,
								false
							),
							correct_option_id: this.getNodeParameter(
								'correct_option_id',
								i,
								undefined
							),
							explanation: this.getNodeParameter('explanation', i, ''),
							open_period: this.getNodeParameter('open_period', i, undefined),
							close_date: this.getNodeParameter('close_date', i, undefined),
							is_closed: this.getNodeParameter('is_closed', i, false),
						}
						break
					case 'send_dice':
						endpoint = '/send_dice'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							emoji: this.getNodeParameter('emoji', i, ''),
						}
						break
					case 'forward_message':
						endpoint = '/forward_message'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							from_chat_id: this.getNodeParameter('from_chat_id', i),
							message_id: this.getNodeParameter('message_id', i),
							disable_notification: this.getNodeParameter(
								'disable_notification',
								i,
								false
							),
						}
						break
					case 'copy_message':
						endpoint = '/copy_message'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							from_chat_id: this.getNodeParameter('from_chat_id', i),
							message_id: this.getNodeParameter('message_id', i),
							caption: this.getNodeParameter('caption', i, ''),
							parse_mode: this.getNodeParameter('parse_mode', i, ''),
							disable_notification: this.getNodeParameter(
								'disable_notification',
								i,
								false
							),
						}
						break
					case 'edit_message_text':
						endpoint = '/edit_message_text'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							message_id: this.getNodeParameter('message_id', i),
							text: this.getNodeParameter('text', i),
							parse_mode: this.getNodeParameter('parse_mode', i, ''),
						}
						break
					case 'edit_message_caption':
						endpoint = '/edit_message_caption'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							message_id: this.getNodeParameter('message_id', i),
							caption: this.getNodeParameter('caption', i),
							parse_mode: this.getNodeParameter('parse_mode', i, ''),
						}
						break
					case 'edit_message_media':
						endpoint = '/edit_message_media'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							message_id: this.getNodeParameter('message_id', i),
							media: this.getNodeParameter('media', i),
							media_type: this.getNodeParameter('media_type', i),
							caption: this.getNodeParameter('caption', i, ''),
							parse_mode: this.getNodeParameter('parse_mode', i, ''),
						}
						break
					case 'delete_message':
						endpoint = '/delete_message'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							message_id: this.getNodeParameter('message_id', i),
						}
						break
					case 'get_messages':
						endpoint = '/get_messages'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							message_ids: this.getNodeParameter('message_ids', i),
						}
						break
					case 'get_message_history':
						endpoint = '/get_message_history'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							limit: this.getNodeParameter('limit', i, 10),
							offset_id: this.getNodeParameter('offset_id', i, 0),
						}
						break
					case 'search_messages':
						endpoint = '/search_messages'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							query: this.getNodeParameter('query', i),
							limit: this.getNodeParameter('limit', i, 10),
						}
						break
					case 'download_media':
						endpoint = '/download_media'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							message_id: this.getNodeParameter('message_id', i),
							file_name: this.getNodeParameter('file_name', i, ''),
						}
						break
					// ... (аналогічно для інших операцій messages
				}
			} else if (resource === 'chats') {
				switch (operation) {
					case 'get_chat':
						endpoint = '/get_chat'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
						}
						break
					case 'get_chat_members':
						endpoint = '/get_chat_members'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							limit: this.getNodeParameter('limit', i, 10),
							offset: this.getNodeParameter('offset', i, 0),
						}
						break
					case 'get_chat_member':
						endpoint = '/get_chat_member'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							user_id: this.getNodeParameter('user_id', i),
						}
						break
					case 'get_chat_administrators':
						endpoint = '/get_chat_administrators'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
						}
						break
					case 'leave_chat':
						endpoint = '/leave_chat'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
						}
						break
					case 'set_chat_title':
						endpoint = '/set_chat_title'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							title: this.getNodeParameter('title', i),
						}
						break
					case 'set_chat_photo':
						endpoint = '/set_chat_photo'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
							photo: this.getNodeParameter('photo', i),
						}
						break
					case 'delete_chat_photo':
						endpoint = '/delete_chat_photo'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							chat_id: this.getNodeParameter('chat_id', i),
						}
						break
				}
			} else if (resource === 'users') {
				switch (operation) {
					case 'get_me':
						endpoint = '/get_me'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
						}
						break
					case 'get_users':
						endpoint = '/get_users'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							user_ids: this.getNodeParameter('user_ids', i),
						}
						break
					case 'get_user_profile_photos':
						endpoint = '/get_user_profile_photos'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							user_id: this.getNodeParameter('user_id', i),
							limit: this.getNodeParameter('limit', i, 10),
							offset: this.getNodeParameter('offset', i, 0),
						}
						break
				}
			} else if (resource === 'contacts') {
				switch (operation) {
					case 'get_contacts':
						endpoint = '/get_contacts'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
						}
						break
					case 'add_contact':
						endpoint = '/add_contact'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							phone_number: this.getNodeParameter('phone_number', i),
							first_name: this.getNodeParameter('first_name', i),
							last_name: this.getNodeParameter('last_name', i, ''),
							user_id: this.getNodeParameter('user_id', i, undefined),
						}
						break
					case 'delete_contacts':
						endpoint = '/delete_contacts'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							user_ids: this.getNodeParameter('user_ids', i),
						}
						break
				}
			} else if (resource === 'bot') {
				switch (operation) {
					case 'get_bot_commands':
						endpoint = '/get_bot_commands'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
						}
						break
					case 'set_bot_commands':
						endpoint = '/set_bot_commands'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							commands: this.getNodeParameter('commands', i),
						}
						break
					case 'delete_bot_commands':
						endpoint = '/delete_bot_commands'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
						}
						break
				}
			} else if (resource === 'advanced') {
				switch (operation) {
					case 'raw_api':
						endpoint = '/raw_api'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							session_string: credentials.sessionString,
							bot_token: credentials.botToken,
							method: this.getNodeParameter('method', i),
							params: this.getNodeParameter('params', i),
						}
						break
					case 'get_session_string':
						endpoint = '/auth'
						body = {
							api_id: credentials.apiId,
							api_hash: credentials.apiHash,
							phone_number: credentials.phoneNumber,
							bot_token: credentials.botToken,
						}
						break
				}
			} else if (resource === 'stories') {
				endpoint = '/get_stories'
				body = {}
			} else if (resource === 'reactions') {
				endpoint = '/get_reactions'
				body = {}
			}
			// TODO: додати інші ресурси

			const baseUrl = credentials.baseUrl as string
			const options = {
				method: method as IHttpRequestMethods,
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'application/json' },
				uri: `${baseUrl}${endpoint}`,
				json: true,
			}
			const responseData = await this.helpers.request(options)
			returnData.push({ json: responseData })
		}
		return [returnData]
	}
}

// n8n-nodes-pyro/nodes/Pyro/Pyro.credentials.ts
import { ICredentialType, INodeProperties } from 'n8n-workflow'

export class PyroApi implements ICredentialType {
	name = 'pyroApi'
	displayName = 'Pyro API'
	documentationUrl = ''
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8000',
			description: 'Base URL of your Pyro FastAPI backend',
		},
		{
			displayName: 'API ID',
			name: 'apiId',
			type: 'number',
			default: 0,
			description: 'Your Telegram API ID',
		},
		{
			displayName: 'API Hash',
			name: 'apiHash',
			type: 'string',
			default: '',
			description: 'Your Telegram API Hash',
		},
		{
			displayName: 'Session String',
			name: 'sessionString',
			type: 'string',
			default: '',
			description: 'Pyrogram session string (optional)',
		},
		{
			displayName: 'Phone Number',
			name: 'phoneNumber',
			type: 'string',
			default: '',
			description: 'Telegram phone number (optional)',
		},
		{
			displayName: 'Bot Token',
			name: 'botToken',
			type: 'string',
			default: '',
			description: 'Telegram bot token (optional)',
		},
	]
}
