import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WPPConnectApi implements ICredentialType {
	name = 'wppconnectApi';
	displayName = 'WPPConnect WhatsApp API';
	//documentationUrl = '<your-docs-url>';
	properties: INodeProperties[] = [
		{
			displayName: 'Base Url',
			name: 'api_url',
			type: 'string',
			default: 'http://127.0.0.1:3333',
		},
		{
			displayName: 'Instance',
			name: 'instance',
			type: 'string',
			default: 'YOUR_INSTANCE_KEY',
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			default: '',
		},

	];
	authenticate = {
		type: 'generic',
		properties: {
			
			header: {
				'Authorization': 'Bearer {{$credentials.key}}',
			},

		},
	} as IAuthenticateGeneric;
}