import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
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
					// Add other message operations here
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
					// Add other chat operations here
				}
			}
			// Add other resources here

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
					returnData.push({ json: { error: (error as Error).message } })
				} else {
					throw error
				}
			}
		}

		return [returnData]
	}
}
