import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	ITriggerFunctions,
	ITriggerResponse,
	IWebhookResponseData,
	IHttpRequestMethods,
} from 'n8n-workflow'
import { nodeDescription } from './Pyro.description'

export class Pyro implements INodeType {
	description: INodeTypeDescription = nodeDescription

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		const returnData: INodeExecutionData[] = []
		const credentials = await this.getCredentials('pyroApi')

		for (let i = 0; i < items.length; i++) {
			const mode = this.getNodeParameter('mode', i, 'execute') as string

			// Якщо це тригер мод, не виконувати операції
			if (mode === 'trigger') {
				continue
			}

			const resource = this.getNodeParameter('resource', i) as string
			const operation = this.getNodeParameter('operation', i) as string
			let endpoint = ''
			let method = 'POST'
			let body: any = {}

			// Базові креденшали для всіх запитів
			const baseCredentials = {
				api_id: credentials.apiId,
				api_hash: credentials.apiHash,
				session_string: credentials.sessionString,
				bot_token: credentials.botToken,
			}

			if (resource === 'messages') {
				switch (operation) {
					case 'send_message':
						endpoint = '/send_message'
						body = {
							...baseCredentials,
							chat_id: this.getNodeParameter('chat_id', i),
							text: this.getNodeParameter('text', i),
							parse_mode: this.getNodeParameter('parse_mode', i, ''),
							disable_notification: this.getNodeParameter(
								'disable_notification',
								i,
								false
							),
						}
						break
					// ... інші operations для messages
				}
			} else if (resource === 'chats') {
				switch (operation) {
					case 'get_chat':
						endpoint = '/get_chat'
						body = {
							...baseCredentials,
							chat_id: this.getNodeParameter('chat_id', i),
						}
						break
					// ... інші operations для chats
				}
			}
			// ... інші resources

			const baseUrl = credentials.baseUrl as string
			const options = {
				method: method as IHttpRequestMethods,
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'application/json' },
				uri: `${baseUrl}${endpoint}`,
				json: true,
			}

			try {
				const responseData = await this.helpers.request(options)
				returnData.push({ json: responseData })
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } })
				} else {
					throw error
				}
			}
		}

		return [returnData]
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData()
		const headerData = this.getHeaderData() as { [key: string]: string }

		// Нормалізувати до масиву
		const dataArray = Array.isArray(bodyData) ? bodyData : [bodyData]

		// Опціональна перевірка аутентифікації
		try {
			const credentials = await this.getCredentials('pyroApi')
			const expected = (credentials as any)?.triggerAuthToken
			if (expected) {
				const provided =
					headerData['x-trigger-auth'] || headerData['X-Trigger-Auth']
				if (!provided || provided !== expected) {
					return {
						workflowData: [],
						webhookResponse: {
							status: 401,
							body: 'Unauthorized',
						},
					}
				}
			}
		} catch (e) {
			// Ігнорувати відсутні креденшали під час виконання
		}

		return {
			workflowData: [this.helpers.returnJsonArray(dataArray)],
		}
	}

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const mode = this.getNodeParameter('mode', 0, 'execute') as string

		// Тільки для trigger mode
		if (mode !== 'trigger') {
			return {
				closeFunction: async () => {},
				manualTriggerFunction: async () => [[]],
			}
		}

		const webhookUrl = this.getNodeWebhookUrl('default')
		const credentials = await this.getCredentials('pyroApi')
		const baseUrl = credentials.baseUrl as string
		const triggerType = this.getNodeParameter(
			'triggerType',
			0,
			'message'
		) as string

		const payload: any = {
			triggerType,
			webhookUrl,
			api_id: credentials.apiId,
			api_hash: credentials.apiHash,
			session_string: credentials.sessionString,
			bot_token: credentials.botToken,
		}

		// Додати специфічні параметри для кожного типу тригера
		if (triggerType === 'message') {
			try {
				const mf = this.getNodeParameter('messageFilters', 0) as any
				payload.filters = {
					chatType: mf?.chatType,
					chatId: mf?.chatId,
					userIds: mf?.userIds,
					textPattern: mf?.textPattern,
					commands: mf?.commands,
				}
			} catch (e) {
				payload.filters = {}
			}
		}

		if (triggerType === 'update') {
			try {
				payload.updateHandlers = this.getNodeParameter('updateHandlers', 0)
			} catch (e) {
				payload.updateHandlers = ['on_callback_query']
			}
		}

		if (triggerType === 'polling') {
			try {
				payload.method = this.getNodeParameter('pollingMethod', 0)
				payload.config = this.getNodeParameter('pollingConfig', 0)
				payload.pollingInterval = this.getNodeParameter('pollingInterval', 0)
			} catch (e) {
				payload.method = 'get_chat_history'
				payload.config = {}
				payload.pollingInterval = 60
			}
		}

		const headers: any = { 'Content-Type': 'application/json' }
		if ((credentials as any).triggerAuthToken) {
			headers['X-Trigger-Auth'] = (credentials as any).triggerAuthToken
		}

		let triggerId: string | undefined

		const closeFunction = async () => {
			if (triggerId) {
				const options = {
					method: 'POST' as IHttpRequestMethods,
					uri: `${baseUrl}/triggers/remove`,
					body: JSON.stringify({ trigger_id: triggerId }),
					headers,
					json: true,
				}
				try {
					await this.helpers.request(options)
					console.log('Removed Pyro trigger', triggerId)
				} catch (err) {
					console.error('Failed to remove Pyro trigger', err)
				}
			}
		}

		const manualTriggerFunction = async () => {
			return [[]]
		}

		// Реєструємо тригер
		const options = {
			method: 'POST' as IHttpRequestMethods,
			uri: `${baseUrl}/triggers/add`,
			body: JSON.stringify(payload),
			headers,
			json: true,
		}

		try {
			console.log('Registering Pyro trigger', {
				baseUrl,
				triggerType,
				webhookUrl,
			})
			const response = await this.helpers.request(options)
			triggerId = response.trigger_id
			console.log('Pyro trigger registered', triggerId)
		} catch (err) {
			console.error('Failed to register Pyro trigger', err)
			throw err
		}

		return {
			closeFunction,
			manualTriggerFunction,
		}
	}
}
