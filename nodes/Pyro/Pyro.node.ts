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
				endpoint = this.getMessagesEndpoint(operation, i, baseCredentials)
				body = this.getMessagesBody(operation, i, baseCredentials, this)
			} else if (resource === 'chats') {
				endpoint = this.getChatsEndpoint(operation, i, baseCredentials)
				body = this.getChatsBody(operation, i, baseCredentials, this)
			} else if (resource === 'users') {
				endpoint = this.getUsersEndpoint(operation, i, baseCredentials)
				body = this.getUsersBody(operation, i, baseCredentials, this)
			} else if (resource === 'contacts') {
				endpoint = this.getContactsEndpoint(operation, i, baseCredentials)
				body = this.getContactsBody(operation, i, baseCredentials, this)
			} else if (resource === 'invite_links') {
				endpoint = this.getInviteLinksEndpoint(operation, i, baseCredentials)
				body = this.getInviteLinksBody(operation, i, baseCredentials, this)
			} else if (resource === 'password') {
				endpoint = this.getPasswordEndpoint(operation, i, baseCredentials)
				body = this.getPasswordBody(operation, i, baseCredentials, this)
			} else if (resource === 'bot') {
				endpoint = this.getBotEndpoint(operation, i, baseCredentials)
				body = this.getBotBody(operation, i, baseCredentials, this)
			} else if (resource === 'utilities') {
				endpoint = this.getUtilitiesEndpoint(operation, i, baseCredentials)
				body = this.getUtilitiesBody(operation, i, baseCredentials, this)
			} else if (resource === 'advanced') {
				endpoint = this.getAdvancedEndpoint(operation, i, baseCredentials)
				body = this.getAdvancedBody(operation, i, baseCredentials, this)
			} else if (resource === 'stories') {
				endpoint = this.getStoriesEndpoint(operation, i, baseCredentials)
				body = this.getStoriesBody(operation, i, baseCredentials, this)
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
