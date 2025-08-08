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
