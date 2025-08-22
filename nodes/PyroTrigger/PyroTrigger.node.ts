import {
	ITriggerFunctions,
	ITriggerResponse,
	IWebhookFunctions,
	IWebhookResponseData,
	INodeType,
	IHttpRequestMethods,
} from 'n8n-workflow'
import { pyroTriggerDescription } from './PyroTrigger.description'

export class PyroTrigger implements INodeType {
	description = pyroTriggerDescription

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData()
		const headerData = this.getHeaderData() as { [key: string]: string }

		// Normalize to array
		const dataArray = Array.isArray(bodyData) ? bodyData : [bodyData]

		// Optional auth check
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
			// Ignore missing credentials during execution
		}

		return {
			workflowData: [this.helpers.returnJsonArray(dataArray)],
		}
	}

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const webhookUrl = (this as any).getNodeWebhookUrl('default')
		const credentials = await this.getCredentials('pyroApi')
		const baseUrl = credentials.baseUrl as string
		const triggerType = this.getNodeParameter('triggerType', 0, 'message') as string

		const payload: any = {
			triggerType,
			webhookUrl,
			api_id: credentials.apiId,
			api_hash: credentials.apiHash,
			session_string: credentials.sessionString,
			bot_token: credentials.botToken,
		}

		// Add specific parameters for each trigger type
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

		// Register trigger
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
			manualTriggerFunction: async () => {},
		}
	}
}