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
	]
}
