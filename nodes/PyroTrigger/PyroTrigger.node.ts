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
			const expected = (credentials as any)?.webhookSecret
			if (expected) {
				const provided =
					headerData['x-webhook-secret'] || headerData['X-Webhook-Secret']
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
		const updateTypes = (this.getNodeParameter(
			'updateTypes',
			0
		) as string[]) || ['message']
		const filters = (this.getNodeParameter('filters', 0) as any) || {}

		const payload: any = {
			updateTypes,
			filters,
			webhookUrl,
			api_id: credentials.apiId,
			api_hash: credentials.apiHash,
			session_string: credentials.sessionString,
			phone_number: credentials.phoneNumber,
			bot_token: credentials.botToken,
		}

		const headers: any = { 'Content-Type': 'application/json' }
		if ((credentials as any).webhookSecret) {
			headers['X-Webhook-Secret'] = (credentials as any).webhookSecret
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
					console.log('Removed Pyrogram trigger', triggerId)
				} catch (err) {
					console.error('Failed to remove Pyrogram trigger', err)
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
			console.log('Registering Pyrogram trigger', {
				baseUrl,
				updateTypes,
				webhookUrl,
			})
			const response = await this.helpers.request(options)
			triggerId = response.trigger_id
			console.log('Pyrogram trigger registered', triggerId)
		} catch (err) {
			console.error('Failed to register Pyrogram trigger', err)
			throw err
		}

		return {
			closeFunction,
			manualTriggerFunction: async () => {},
		}
	}
}
