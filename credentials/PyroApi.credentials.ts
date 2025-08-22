import { ICredentialType, INodeProperties } from 'n8n-workflow'

export class PyroApi implements ICredentialType {
	name = 'pyroApi'
	displayName = 'Pyro API'
	documentationUrl = 'https://docs.pyrogram.org/'
	properties: INodeProperties[] = [
		{
			displayName: 'API ID',
			name: 'apiId',
			type: 'number',
			default: 0,
			required: true,
			description: 'Telegram API ID from my.telegram.org',
		},
		{
			displayName: 'API Hash',
			name: 'apiHash',
			type: 'string',
			default: '',
			required: true,
			description: 'Telegram API Hash from my.telegram.org',
		},
		{
			displayName: 'Session String',
			name: 'sessionString',
			type: 'string',
			default: '',
			required: false,
			description: 'Pyrogram session string for persistent auth',
		},
		{
			displayName: 'Phone Number',
			name: 'phoneNumber',
			type: 'string',
			default: '',
			required: false,
			description: 'Phone number for authentication (if no session string)',
		},
		{
			displayName: 'Bot Token',
			name: 'botToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'Bot token for bot authentication',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8000',
			required: true,
			description: 'Base URL of the Pyro FastAPI backend service',
		},
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'Secret for webhook authentication (optional)',
		},
	]
}
