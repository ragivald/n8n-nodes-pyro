import { IHttpRequestMethods } from 'n8n-workflow'
import { ITriggerFunctions, IWebhookFunctions } from 'n8n-core'
import {
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
} from 'n8n-workflow'
import { triggerDescription } from './PyrogramTrigger.description'

export class PyrogramTrigger implements INodeType {
	description: INodeTypeDescription = triggerDescription

	async webhook(this: IWebhookFunctions) {
		const body = this.getBodyData()
		return {
			workflowData: [this.helpers.returnJsonArray([body])],
		}
	}

	async trigger(this: ITriggerFunctions) {
		const webhookUrl = this.getNodeWebhookUrl('default')
		const credentials = await this.getCredentials('pyroApi')
		const baseUrl = credentials.baseUrl as string
		const triggerType = this.getNodeParameter('triggerType') as string
		const payload: any = {
			triggerType,
			webhookUrl,
			api_id: credentials.apiId,
			api_hash: credentials.apiHash,
		}
		if (triggerType === 'message') {
			payload.filters = this.getNodeParameter('messageFilters', 0)
		}
		if (triggerType === 'polling') {
			payload.method = this.getNodeParameter('pollingMethod', 0)
			payload.config = this.getNodeParameter('pollingConfig', 0)
			payload.pollingInterval = this.getNodeParameter('pollingInterval', 0)
		}

		// call backend /triggers/add with auth header
		const url = `${baseUrl}/triggers/add`
		const headers: any = { 'Content-Type': 'application/json' }
		if (credentials.triggerAuthToken) {
			headers['X-Trigger-Auth'] = credentials.triggerAuthToken
		}
		const options = {
			method: 'POST' as IHttpRequestMethods,
			uri: url,
			body: JSON.stringify(payload),
			headers,
			json: true,
		}
		const response = await this.helpers.request(options)
		// store trigger id in workflow data (node context)
		await this.setWorkflowStaticData('triggerId', response.trigger_id)
		return true
	}

	async deactivate(this: ITriggerFunctions) {
		const credentials = await this.getCredentials('pyroApi')
		const baseUrl = credentials.baseUrl as string
		const triggerId = this.getWorkflowStaticData('triggerId')
		if (!triggerId) return true
		const url = `${baseUrl}/triggers/remove`
		const headers: any = { 'Content-Type': 'application/json' }
		if (credentials.triggerAuthToken) {
			headers['X-Trigger-Auth'] = credentials.triggerAuthToken
		}
		const options = {
			method: 'POST' as IHttpRequestMethods,
			uri: url,
			body: JSON.stringify({ trigger_id: triggerId }),
			headers,
			json: true,
		}
		await this.helpers.request(options)
		return true
	}
}
