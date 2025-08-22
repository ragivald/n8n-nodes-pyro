import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
} from 'n8n-workflow'
import { nodeDescription } from './Pyro.description'

export class Pyrogram implements INodeType {
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

			// Base credentials for all requests
			const baseCredentials = {
				api_id: credentials.apiId,
				api_hash: credentials.apiHash,
				session_string: credentials.sessionString,
				phone_number: credentials.phoneNumber,
				bot_token: credentials.botToken,
			}

			// Route based on resource and operation
			if (resource === 'messages') {
				switch (operation) {
					case 'send_message':
						endpoint = '/send_message'
						body = {
							...baseCredentials,
							chat_id:
								parseInt(this.getNodeParameter('chat_id', i) as string) ||
								this.getNodeParameter('chat_id', i),
							text: this.getNodeParameter('text', i),
							parse_mode:
								this.getNodeParameter('parse_mode', i, '') || undefined,
							disable_notification: this.getNodeParameter(
								'disable_notification',
								i,
								false
							),
							disable_web_page_preview: this.getNodeParameter(
								'disable_web_page_preview',
								i,
								false
							),
							reply_to_message_id:
								this.getNodeParameter('reply_to_message_id', i, 0) || undefined,
						}
						break
					case 'send_photo':
						endpoint = '/send_photo'
						body = baseCredentials
						break
					case 'send_video':
						endpoint = '/send_video'
						body = baseCredentials
						break
					case 'send_audio':
						endpoint = '/send_audio'
						body = baseCredentials
						break
					case 'send_document':
						endpoint = '/send_document'
						body = baseCredentials
						break
					case 'send_voice':
						endpoint = '/send_voice'
						body = baseCredentials
						break
					case 'send_video_note':
						endpoint = '/send_video_note'
						body = baseCredentials
						break
					case 'send_animation':
						endpoint = '/send_animation'
						body = baseCredentials
						break
					case 'send_sticker':
						endpoint = '/send_sticker'
						body = baseCredentials
						break
					case 'send_location':
						endpoint = '/send_location'
						body = baseCredentials
						break
					case 'send_venue':
						endpoint = '/send_venue'
						body = baseCredentials
						break
					case 'send_contact':
						endpoint = '/send_contact'
						body = baseCredentials
						break
					case 'send_poll':
						endpoint = '/send_poll'
						body = baseCredentials
						break
					case 'send_dice':
						endpoint = '/send_dice'
						body = baseCredentials
						break
					case 'send_media_group':
						endpoint = '/send_media_group'
						body = baseCredentials
						break
					case 'forward_messages':
						endpoint = '/forward_message'
						body = baseCredentials
						break
					case 'copy_messages':
						endpoint = '/copy_message'
						body = baseCredentials
						break
					case 'edit_message_text':
						endpoint = '/edit_message_text'
						body = baseCredentials
						break
					case 'edit_message_caption':
						endpoint = '/edit_message_caption'
						body = baseCredentials
						break
					case 'edit_message_media':
						endpoint = '/edit_message_media'
						body = baseCredentials
						break
					case 'delete_messages':
						endpoint = '/delete_message'
						body = baseCredentials
						break
					case 'get_messages':
						endpoint = '/get_messages'
						body = baseCredentials
						break
					case 'get_chat_history':
						endpoint = '/get_message_history'
						body = baseCredentials
						break
					case 'search_messages':
						endpoint = '/search_messages'
						body = baseCredentials
						break
					case 'download_media':
						endpoint = '/download_media'
						body = baseCredentials
						break
					case 'send_chat_action':
						endpoint = '/send_chat_action'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported messages operation: ${operation}`)
				}
			} else if (resource === 'chats') {
				switch (operation) {
					case 'join_chat':
						endpoint = '/join_chat'
						body = baseCredentials
						break
					case 'leave_chat':
						endpoint = '/leave_chat'
						body = baseCredentials
						break
					case 'get_chat':
						endpoint = '/get_chat'
						body = baseCredentials
						break
					case 'get_chat_members':
						endpoint = '/get_chat_members'
						body = baseCredentials
						break
					case 'get_chat_member':
						endpoint = '/get_chat_member'
						body = baseCredentials
						break
					case 'ban_chat_member':
						endpoint = '/ban_chat_member'
						body = baseCredentials
						break
					case 'unban_chat_member':
						endpoint = '/unban_chat_member'
						body = baseCredentials
						break
					case 'restrict_chat_member':
						endpoint = '/restrict_chat_member'
						body = baseCredentials
						break
					case 'promote_chat_member':
						endpoint = '/promote_chat_member'
						body = baseCredentials
						break
					case 'set_chat_title':
						endpoint = '/set_chat_title'
						body = baseCredentials
						break
					case 'set_chat_description':
						endpoint = '/set_chat_description'
						body = baseCredentials
						break
					case 'set_chat_photo':
						endpoint = '/set_chat_photo'
						body = baseCredentials
						break
					case 'delete_chat_photo':
						endpoint = '/delete_chat_photo'
						body = baseCredentials
						break
					case 'pin_chat_message':
						endpoint = '/pin_chat_message'
						body = baseCredentials
						break
					case 'unpin_chat_message':
						endpoint = '/unpin_chat_message'
						body = baseCredentials
						break
					case 'create_group':
						endpoint = '/create_group'
						body = baseCredentials
						break
					case 'create_channel':
						endpoint = '/create_channel'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported chats operation: ${operation}`)
				}
			} else if (resource === 'users') {
				switch (operation) {
					case 'get_me':
						endpoint = '/get_me'
						body = baseCredentials
						break
					case 'get_users':
						endpoint = '/get_users'
						body = baseCredentials
						break
					case 'get_chat_photos':
						endpoint = '/get_user_profile_photos'
						body = baseCredentials
						break
					case 'set_profile_photo':
						endpoint = '/set_profile_photo'
						body = baseCredentials
						break
					case 'delete_profile_photos':
						endpoint = '/delete_profile_photos'
						body = baseCredentials
						break
					case 'update_profile':
						endpoint = '/update_profile'
						body = baseCredentials
						break
					case 'block_user':
						endpoint = '/block_user'
						body = baseCredentials
						break
					case 'unblock_user':
						endpoint = '/unblock_user'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported users operation: ${operation}`)
				}
			} else if (resource === 'contacts') {
				switch (operation) {
					case 'get_contacts':
						endpoint = '/get_contacts'
						body = baseCredentials
						break
					case 'add_contact':
						endpoint = '/add_contact'
						body = baseCredentials
						break
					case 'delete_contacts':
						endpoint = '/delete_contacts'
						body = baseCredentials
						break
					case 'import_contacts':
						endpoint = '/import_contacts'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported contacts operation: ${operation}`)
				}
			} else if (resource === 'invite_links') {
				switch (operation) {
					case 'get_chat_invite_link_info':
						endpoint = '/get_chat_invite_link_info'
						body = baseCredentials
						break
					case 'export_chat_invite_link':
						endpoint = '/export_chat_invite_link'
						body = baseCredentials
						break
					case 'create_chat_invite_link':
						endpoint = '/create_chat_invite_link'
						body = baseCredentials
						break
					case 'edit_chat_invite_link':
						endpoint = '/edit_chat_invite_link'
						body = baseCredentials
						break
					case 'revoke_chat_invite_link':
						endpoint = '/revoke_chat_invite_link'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported invite_links operation: ${operation}`)
				}
			} else if (resource === 'password') {
				switch (operation) {
					case 'enable_cloud_password':
						endpoint = '/enable_cloud_password'
						body = baseCredentials
						break
					case 'change_cloud_password':
						endpoint = '/change_cloud_password'
						body = baseCredentials
						break
					case 'remove_cloud_password':
						endpoint = '/remove_cloud_password'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported password operation: ${operation}`)
				}
			} else if (resource === 'bot') {
				switch (operation) {
					case 'set_bot_commands':
						endpoint = '/set_bot_commands'
						body = baseCredentials
						break
					case 'get_bot_commands':
						endpoint = '/get_bot_commands'
						body = baseCredentials
						break
					case 'delete_bot_commands':
						endpoint = '/delete_bot_commands'
						body = baseCredentials
						break
					case 'answer_callback_query':
						endpoint = '/answer_callback_query'
						body = baseCredentials
						break
					case 'answer_inline_query':
						endpoint = '/answer_inline_query'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported bot operation: ${operation}`)
				}
			} else if (resource === 'utilities') {
				switch (operation) {
					case 'start':
						endpoint = '/start'
						body = baseCredentials
						break
					case 'stop':
						endpoint = '/stop'
						body = baseCredentials
						break
					case 'export_session_string':
						endpoint = '/export_session_string'
						body = baseCredentials
						break
					case 'set_parse_mode':
						endpoint = '/set_parse_mode'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported utilities operation: ${operation}`)
				}
			} else if (resource === 'advanced') {
				switch (operation) {
					case 'invoke':
						endpoint = '/raw_api'
						body = baseCredentials
						break
					case 'resolve_peer':
						endpoint = '/resolve_peer'
						body = baseCredentials
						break
					case 'save_file':
						endpoint = '/save_file'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported advanced operation: ${operation}`)
				}
			} else if (resource === 'stories') {
				switch (operation) {
					case 'send_story':
						endpoint = '/send_story'
						body = baseCredentials
						break
					case 'get_stories':
						endpoint = '/get_stories'
						body = baseCredentials
						break
					case 'delete_stories':
						endpoint = '/delete_stories'
						body = baseCredentials
						break
					default:
						throw new Error(`Unsupported stories operation: ${operation}`)
				}
			} else {
				throw new Error(`Unsupported resource: ${resource}`)
			}

			const baseUrl = credentials.baseUrl as string
			const fullUrl = `${baseUrl}${endpoint}`

			// Add validation
			if (!endpoint) {
				throw new Error(
					`No endpoint configured for resource: ${resource}, operation: ${operation}`
				)
			}

			const options = {
				method: method as IHttpRequestMethods,
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'application/json' },
				uri: fullUrl,
				json: true,
			}

			try {
				console.log(`Making request to: ${fullUrl}`)
				console.log(`Request body:`, JSON.stringify(body, null, 2))
				const responseData = await this.helpers.request(options)
				returnData.push({ json: responseData })
			} catch (error) {
				const errorMessage = `Request failed to ${fullUrl}: ${
					(error as Error).message
				}`
				console.error(errorMessage)
				if (this.continueOnFail()) {
					returnData.push({ json: { error: errorMessage, endpoint, body } })
				} else {
					throw new Error(errorMessage)
				}
			}
		}

		return [returnData]
	}

	private getMessagesEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'send_message':
				return '/send_message'
			case 'send_photo':
				return '/send_photo'
			case 'send_video':
				return '/send_video'
			case 'send_audio':
				return '/send_audio'
			case 'send_document':
				return '/send_document'
			case 'send_voice':
				return '/send_voice'
			case 'send_video_note':
				return '/send_video_note'
			case 'send_animation':
				return '/send_animation'
			case 'send_sticker':
				return '/send_sticker'
			case 'send_location':
				return '/send_location'
			case 'send_venue':
				return '/send_venue'
			case 'send_contact':
				return '/send_contact'
			case 'send_poll':
				return '/send_poll'
			case 'send_dice':
				return '/send_dice'
			case 'send_media_group':
				return '/send_media_group'
			case 'forward_messages':
				return '/forward_message' // Backend uses singular
			case 'copy_messages':
				return '/copy_message' // Backend uses singular
			case 'edit_message_text':
				return '/edit_message_text'
			case 'edit_message_caption':
				return '/edit_message_caption'
			case 'edit_message_media':
				return '/edit_message_media'
			case 'delete_messages':
				return '/delete_message' // Backend uses singular
			case 'get_messages':
				return '/get_messages'
			case 'get_chat_history':
				return '/get_message_history' // Backend uses different name
			case 'search_messages':
				return '/search_messages'
			case 'download_media':
				return '/download_media'
			case 'send_chat_action':
				return '/send_chat_action'
			default:
				throw new Error(`Unsupported messages operation: ${operation}`)
		}
	}

	private getMessagesBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		switch (operation) {
			case 'send_message':
				return {
					...baseCredentials,
					chat_id:
						parseInt(
							executionContext.getNodeParameter('chat_id', itemIndex) as string
						) || executionContext.getNodeParameter('chat_id', itemIndex),
					text: executionContext.getNodeParameter('text', itemIndex),
					parse_mode:
						executionContext.getNodeParameter('parse_mode', itemIndex, '') ||
						undefined,
					disable_notification: executionContext.getNodeParameter(
						'disable_notification',
						itemIndex,
						false
					),
					disable_web_page_preview: executionContext.getNodeParameter(
						'disable_web_page_preview',
						itemIndex,
						false
					),
					reply_to_message_id:
						executionContext.getNodeParameter(
							'reply_to_message_id',
							itemIndex,
							0
						) || undefined,
				}
			default:
				return baseCredentials
		}
	}

	private getChatsEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'join_chat':
				return '/join_chat'
			case 'leave_chat':
				return '/leave_chat'
			case 'get_chat':
				return '/get_chat'
			case 'get_chat_members':
				return '/get_chat_members'
			case 'get_chat_member':
				return '/get_chat_member'
			case 'ban_chat_member':
				return '/ban_chat_member'
			case 'unban_chat_member':
				return '/unban_chat_member'
			case 'restrict_chat_member':
				return '/restrict_chat_member'
			case 'promote_chat_member':
				return '/promote_chat_member'
			case 'set_chat_title':
				return '/set_chat_title'
			case 'set_chat_description':
				return '/set_chat_description'
			case 'set_chat_photo':
				return '/set_chat_photo'
			case 'delete_chat_photo':
				return '/delete_chat_photo'
			case 'pin_chat_message':
				return '/pin_chat_message'
			case 'unpin_chat_message':
				return '/unpin_chat_message'
			case 'create_group':
				return '/create_group'
			case 'create_channel':
				return '/create_channel'
			default:
				throw new Error(`Unsupported chats operation: ${operation}`)
		}
	}

	private getChatsBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getUsersEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'get_me':
				return '/get_me'
			case 'get_users':
				return '/get_users'
			case 'get_chat_photos':
				return '/get_user_profile_photos'
			case 'set_profile_photo':
				return '/set_profile_photo'
			case 'delete_profile_photos':
				return '/delete_profile_photos'
			case 'update_profile':
				return '/update_profile'
			case 'block_user':
				return '/block_user'
			case 'unblock_user':
				return '/unblock_user'
			default:
				throw new Error(`Unsupported users operation: ${operation}`)
		}
	}

	private getUsersBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getContactsEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'get_contacts':
				return '/get_contacts'
			case 'add_contact':
				return '/add_contact'
			case 'delete_contacts':
				return '/delete_contacts'
			case 'import_contacts':
				return '/import_contacts'
			default:
				throw new Error(`Unsupported contacts operation: ${operation}`)
		}
	}

	private getContactsBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getInviteLinksEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'get_chat_invite_link_info':
				return '/get_chat_invite_link_info'
			case 'export_chat_invite_link':
				return '/export_chat_invite_link'
			case 'create_chat_invite_link':
				return '/create_chat_invite_link'
			case 'edit_chat_invite_link':
				return '/edit_chat_invite_link'
			case 'revoke_chat_invite_link':
				return '/revoke_chat_invite_link'
			default:
				throw new Error(`Unsupported invite_links operation: ${operation}`)
		}
	}

	private getInviteLinksBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getPasswordEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'enable_cloud_password':
				return '/enable_cloud_password'
			case 'change_cloud_password':
				return '/change_cloud_password'
			case 'remove_cloud_password':
				return '/remove_cloud_password'
			default:
				throw new Error(`Unsupported password operation: ${operation}`)
		}
	}

	private getPasswordBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getBotEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'set_bot_commands':
				return '/set_bot_commands'
			case 'get_bot_commands':
				return '/get_bot_commands'
			case 'delete_bot_commands':
				return '/delete_bot_commands'
			case 'answer_callback_query':
				return '/answer_callback_query'
			case 'answer_inline_query':
				return '/answer_inline_query'
			default:
				throw new Error(`Unsupported bot operation: ${operation}`)
		}
	}

	private getBotBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getUtilitiesEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'start':
				return '/start'
			case 'stop':
				return '/stop'
			case 'export_session_string':
				return '/export_session_string'
			case 'set_parse_mode':
				return '/set_parse_mode'
			default:
				throw new Error(`Unsupported utilities operation: ${operation}`)
		}
	}

	private getUtilitiesBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getAdvancedEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'invoke':
				return '/raw_api'
			case 'resolve_peer':
				return '/resolve_peer'
			case 'save_file':
				return '/save_file'
			default:
				throw new Error(`Unsupported advanced operation: ${operation}`)
		}
	}

	private getAdvancedBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
	}

	private getStoriesEndpoint(
		operation: string,
		itemIndex: number,
		baseCredentials: any
	): string {
		switch (operation) {
			case 'send_story':
				return '/send_story'
			case 'get_stories':
				return '/get_stories'
			case 'delete_stories':
				return '/delete_stories'
			default:
				throw new Error(`Unsupported stories operation: ${operation}`)
		}
	}

	private getStoriesBody(
		operation: string,
		itemIndex: number,
		baseCredentials: any,
		executionContext: IExecuteFunctions
	): any {
		return baseCredentials
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
