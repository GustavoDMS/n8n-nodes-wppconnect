import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { OptionsWithUri } from 'request-promise-native';
export class WPPConnect implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WPPConnect',
		name: 'WPPConnect',
		icon: 'file:logo192.svg',
		version: 0,
		defaults: {
			name: 'WPPConnect',
		},
		inputs: ['main'],
		outputs: ['main'],
		group: [],
		description: 'WPPConnect n8n node by Gustavo Doria',
		credentials: [
			{
				name: 'wppconnectApi',
				required: true,
			},
		],
		// requestDefaults: {
		//     baseURL: 'http://127.0.0.1:3333',
		//     headers: {
		//         Accept: 'application/json',
		//         'Content-Type': 'application/json',
		//     },
		// },
		properties: [

			{
				displayName: "To", 
				name: "id",
				type: "string",
				required: true,
				default: '',
				description: 'The contact number to send the message to',
			},
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Audio Message',
						value: 'audioMessage',
					},
					{
						name: 'Button With Media',
						value: 'buttomWithMedia',
					},
					{
						name: 'Button(Template) Message',
						value: 'templateMessage',
					},
					{
						name: 'Contact Message',
						value: 'contactMessage',
					},
					{
						name: 'Document Message',
						value: 'documentMessage',
					},
					{
						name: 'File URL',
						value: 'fileUrl',
					},
					{
						name: 'Image Message',
						value: 'imageMessage',
					},
					{
						name: 'List Message',
						value: 'listMessage',
					},
					{
						name: 'Text Message',
						value: 'textMessage',
					},
					{
						name: 'Video Message',
						value: 'videoMessage',
					},
				],
				default: 'textMessage',
			},
			{
				displayName: 'Tittle',
				name: 'titleMessage',
				type: 'string',

				default: '',
				displayOptions: {
					show: {
						messageType: [
							'templateMessage',
						],
					},
				},
			},
			{
				displayName: 'Text Message',
				name: 'message',
				type: 'string',
				required: true,
				typeOptions: {
					rows: 5,
				},
				default: '',


				displayOptions: {
					show: {
						messageType: [
							'textMessage',
							'templateMessage',
						],
					},
				},
			},
			{
				displayName: 'Button Template',
				name: 'btnTemplate',
				placeholder: 'Add Button',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,

				},

				options: [
					{
						name: 'btn',
						displayName: 'Button',
						values: [
							{
								displayName: 'Button Type',
								name: 'btnType',
								type: 'options',
								options: [
									{
										name: 'Reply Button',
										value: 'replyButton',
									},
									{
										name: 'URL Button',
										value: 'urlButton',
									},
									{
										name: 'Click to Call',
										value: 'callButton',
									},
								],
								default: 'replyButton',
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'Button title',
							},
							{
								displayName: 'Payload',
								name: 'payload',
								type: 'string',
								default: '',
								description: 'The payload for the button',
								displayOptions: {
									show: {
										btnType: [
											'urlButton',
											'callButton',
										],
									},
								},
							},
						],
					},
				],
				displayOptions: {
					show: {
						messageType: [
							'templateMessage',
						],

					},
				},
			},
			{
				displayName: 'Footer',
				name: 'footerMessage',
				type: 'string',

				default: '',
				displayOptions: {
					show: {
						messageType: [
							'templateMessage',
						],
					},
				},
			},
		],
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let responseData;
		const messageType = this.getNodeParameter('messageType', 0) as string;
		const id = this.getNodeParameter('id', 0) as string;
		//Get credentials the user provided for this node
		const credentials = await this.getCredentials('wppconnectApi') as IDataObject;

		if (messageType === 'textMessage') {

			const message = this.getNodeParameter('message', 0) as string;
			const data: IDataObject = {
				phone:id,
				message,
				isGourp: false,
			};

			responseData = await this.helpers.request(sendMessage(data, 'send-message'));
		}
		//Buttom template message
		if (messageType === 'templateMessage') {

			const message = this.getNodeParameter('message', 0) as string;
			const btndata = (this.getNodeParameter('btnTemplate',0) as IDataObject);
			const btn = btndata.btn as IDataObject[];
			//console.log(btn);
			const buttons: IDataObject[] = [];
			btn.forEach((element: IDataObject, index) => {
				//index = index + 1;
				const btnType = element.btnType as string;
				if (btnType === 'replyButton') {
					buttons.push({
						id: index.toString(),
						text: element.title as string,
					});
				} else if (btnType === 'urlButton') {
					buttons.push({
						id: index.toString(),
						text: element.title as string,
						url: element.payload as string,
					});
				} else if (btnType === 'callButton') {
					buttons.push({
						id: index.toString(),
						text: element.title as string,
						phoneNumber: element.payload as string,
					});
				}
			});

			const data: IDataObject = {
				phone:id,
				message,
				options:{
					useTemplateButtons: true,
					buttons,
					title: this.getNodeParameter('titleMessage', 0) as string,
					footer: this.getNodeParameter('footerMessage', 0) as string,

				},
			
			};
			responseData = await this.helpers.request(sendMessage(data, 'send-buttons'));
			console.log(data);

		}
		// Map data to n8n data
		//console.log(responseData);
		return [this.helpers.returnJsonArray(responseData)];

		function sendMessage(data: IDataObject, operation: string) {
			
			const options: OptionsWithUri = {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${credentials.token}`,
				},
				method: 'POST',
				body: data,
				uri: `${credentials.api_url}/${credentials.instance}/${operation}`,
				json:true,
			};
			//console.log(options);
			return options;
			
		}
	}
}