// Generates massive amount of data by passing modal name and no of data you need
const faker = require('faker');
const {ROLES} = require('../constants/permissions');

const createdSampleData = (model, number, options = {}) => {
	let data;
	switch (model) {
		// case 'folders':
		// 	data = folderSampleData(number);
		// 	break;
		case 'accounts':
			data = accountsSampleData(number);
			break;
		case 'users':
			data = usersSampleData(number);
			break;
		case 'tasks':
			data = taskSampleData(number);
			break;
		case 'leads_clients':
			data = leadClientSampleData(number);
			break;
		case 'companies':
			data = companySampleData(number);
			break;
		case 'contacts':
			data = contactSampleData(number);
			break;
		case 'histories':
			data = historySampleData(number);
			break;
		case 'notes':
			data = notesSampleData(number);
			break;
		case 'sections':
			data = sectionsSampleData(number);
			break;
		// case 'files':
		// 	data = filesSampleData(number);
		// 	break;
		case 'sales_stages':
			data = saleStageSampleData(number);
			break;
		case 'custom_fields':
			data = customFieldSampleData(number);
			break;
		case 'lost_lead_fields':
			data = lostLeadFields(number);
			break;
		case 'lead_additional_fields':
			data = leadAdditionalSampleData(number);
			break;
		case 'supplier_details':
			data = supplierAdditionalSampleData(number);
			break;
		case 'call_outcomes':
			data = callOutcomeSampleData(number);
			break;
		case 'call_outcomes_transitions':
			data = callOutcomeTransitionSampleData(number);
			break;
		case 'suppliers':
			data = suppliersSampleData(number);
			break;
		case 'permission_sets':
			data = createPermisionData(number);
			break;
		case 'user_roles':
			data = createRoleData(number);
			break;
		case 'campaigns':
			data = campaignSampleData(number);
			break;
		case 'subscriber_lists':
			data = subscriberList(number);
			break;
		case 'subscriber_emails':
			data = subscriberEmail(number);
			break;
		case 'email_lists':
			data = createEmailList(number);
			break;
		case 'segment_lists':
			data = createSegments(number);
			break;
		case 'todos':
			data = todoSampleData(number);
			break;
		case 'categories':
			data = categorySampleData(number);
			break;
		case 'email_templates':
			data = emailTemplateData(number, options.type);
			break;
		case 'events':
			data = eventSampleData(number);
			break;
		case 'todo_contacts':
			data = todoContactSampleData(number);
			break;
		case 'event_recipients':
			data = eventRecipientSampleData(number);
		case 'event_repeats':
			data = eventRepeatsData(number);
			break;
		case 'timezones':
			data = timezoneData(number);
			break;
		case 'permissions':
			data = permissionsData(number)
			break;
		case 'call_lists':
			data = callListSampleData(number)
		// case 'sections':
		// 	data = sectionsSampleData(number)
		default:
			console.log('default');
	}
	return data;
}

// for demo
// const folderSampleData = (number) => {
// 	let generatedData = []
// 	for (let i = 0; i < number; i++) {
// 		generatedData.push({
// 			name: faker.system.fileName()
// 		});
// 	}
// 	return generatedData;
// }

// const filesSampleData = (number) => {
// 	let generatedData = []
// 	for (let i = 0; i < number; i++) {
// 		const fileName = `${faker.lorem.word()}.jpeg`;
// 		generatedData.push({
// 			name: fileName,
// 			folder_id: null,
// 			type: 'image/jpeg',
// 			created_by: 0,
// 			path: `root/${fileName}`, // @TODO change the path
// 			size: faker.random.number(),
// 			description: faker.lorem.sentence(),
// 			tag: faker.lorem.word(),
// 			master_name: fileName,
// 			count: 0,
// 			aspect_ratio: 0
// 		});
// 	}
// 	return generatedData;
// }

const suppliersSampleData = (number) => {
	console.log("supller sample data")
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			first_name: faker.name.findName(),
			last_name: faker.name.findName(),
			email: "gourav.pwd@cisinlabs.com",
			company_name: faker.company.companyName(),
		});
	}
	return generatedData;
}


const callListSampleData = (number) =>{

	generatedData = []
	for(let i=0; i< number; i++){
		generatedData.push({
			// first_name:
			// name:'test',
			description:'testing',
			sechdule_date: new Date(),
			user_id: 1,
			include_existing_call_contact:1,
			// custom_filter_id:1,
			updated_at: new Date(),
			created_at: new Date()

		})
	}
	return generatedData;
}

const leadClientSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			"sales_stage_id": 1,
			"type": "LEAD",
			"lead_client_details": [{
				'custom_field_id': 1,
				'field_value': faker.name.findName()
			}],
			"contacts": {
				"first_name": faker.name.findName(),
				"last_name": faker.name.findName(),
				"email": "gourav.pwd@cisinlabs.com",
				"phone_number": faker.random.number(),
				"entity_type": "LEAD_CLIENT",
				"contact_details": [{
					'custom_field_id': 1,
					'field_value': faker.name.findName()
				}]
			},
			"companies": {
				"name": faker.company.companyName(),
				"entity_type": "LEAD_CLIENT",
				"company_details": [{
					'custom_field_id': 1,
					'field_value': faker.name.findName()
				}]
			}
		});
	}
	return generatedData;
}

const clientSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			sales_stage_id: 0,
			type: "CLIENT",
			user_id: 1
		});
	}
	return generatedData;
}

const contactSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			first_name: faker.name.findName(),
			last_name: faker.name.findName(),
			email: "gourav.pwd@cisinlabs.com",
			phone_number: faker.phone.phoneNumber()
		});
	}
	return generatedData;
}

const companySampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: faker.name.findName(),
			entity_id: 1,
			entity_type: "LEAD_CLIENT"
		});
	}
	return generatedData;
}

const taskSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			task_type: "CALL",
			reason_for_call: "Any reason",
			start: faker.date.past(),
			is_completed: 0,
			priority_order: 0,
		});
	}
	return generatedData;
}
const usersSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			first_name: faker.name.findName(),
			last_name: faker.name.findName(),
			email: "ripple.cis2018@gmail.com",
			password: faker.internet.password(),
			role_id: "1",
			permission_set_id: 1,
			is_secure_access:0
		});
	}
	return generatedData;
}
/**
 *
 * {email : ripple.cis2018@gmail.com, pass : CISrAws0me@2018!**}
 */

const historySampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			user_id: null,
			contact_id: null
		});
	}
	return generatedData;
}

const notesSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			note: "Any note",
			entity_type: "LEAD_CLIENT",
			entity_id: 1,
		});
	}
	return generatedData;
}

const callOutcomeSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: faker.name.findName(),
			priority_order: 0
		});
	}
	return generatedData;
}

const callOutcomeTransitionSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			start_time: faker.date.past(),
			end_time: faker.date.past(),
			task_id: 0,
			user_id: 0,
			outcome_id: 0
		});
	}
	return generatedData;
}

const sectionsSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: faker.name.findName(),
			description: "Any description",
			type: "LEAD_CLIENT",
			priority_order: 0,
			custom_fields: [],
			restrict_action: '0'
		});
	}
	return generatedData;
}

const saleStageSampleData = (number) => {
	generatedData = [{
		id: 1,
		name: 'Unqualified',
		description: 'Still to Contact',
		default_id: 1,
		close_probability: 0,
		priority_order: 0
	}, {
		id: 2,
		name: 'Quotation / Proposal',
		description: 'Issued Quote',
		default_id: 2,
		close_probability: 50,
		priority_order: 1
	}, {
		id: 3,
		name: 'Negotiation',
		description: 'Closing the Sale',
		default_id: 3,
		close_probability: 60,
		priority_order: 2
	}, {
		id: 4,
		name: 'Confirmation',
		description: 'Invoice Issued',
		default_id: 4,
		close_probability: 95,
		priority_order: 3
	}, {
		id: 5,
		name: 'Paid',
		description: 'Funds Received',
		default_id: 5,
		close_probability: 100,
		priority_order: 4
	},
	{
		id: 6,
		name: 'Need Analysis',
		description: 'Initial Discussions',
		default_id: 6,
		close_probability: 25,
		priority_order: 5
	},
	{
		id: 7,
		name: 'Lost Leads',
		description: 'Lost Sale',
		default_id: 7,
		close_probability: 0,
		priority_order: 6
	},
	{
		id: 8,
		name: 'CONVERT TO CLIENT',
		description: 'YOU DID IT!',
		default_id: 8,
		close_probability: 0,
		priority_order: 7
	}
	];
	return generatedData;
}

const customFieldSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		let name = faker.name.findName();
		generatedData.push({
			label: name,
			model_name : 'first_name',
			table_name : 'contacts',
			placeholder: name,
			help_text: name,
			control_type: "textfield",
			priority_order: i,
			is_hidden: 0,
			field_size: 6,
			restrict_action: '0'
		});
	}
	return generatedData;
}

const lostLeadFields = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			lead_client_id: i + 1,
			lost_identifier: faker.name.findName(),
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const leadAdditionalSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			field_id: faker.random.number(),
			field_value: faker.name.findName(),
			lead_id: faker.random.number(),
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const supplierAdditionalSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			// field_id: faker.random.number(),
			custom_field_id:faker.random.number(),
			field_value: faker.name.findName(),
			supplier_id: faker.random.number(),
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const createPermisionData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: "Default set",
			description: '',
			json_data: null,
			created_by: 1,
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}
const createRoleData = (number) => {
	generatedData = []
	generatedData.push({
		name: ROLES.ADMIN,
		created_at: faker.date.past(),
		updated_at: faker.date.past(),
	});

	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: faker.name.findName(),
			parent_id: null,
			created_by: null,
			created_at: faker.date.past(),
			updated_at: faker.date.past(),
		});
	}
	return generatedData;
}

const campaignSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: 'email_campaign',
			from_name: 'ashish',
			from_email: 'vikas.b@cisinlabs.com',
			reply_email: 'pushpendra.c@cisinlabs.com',
			subject_line: 'new subject',
			preheader_text: 'preheader_text',
			scheduled_time: '2019-04-04 13:43:00',
			status: 'SCHEDULED',
			email_percentage: 0,
			is_scheduled: 1,
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const createEmailList = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			list_name: faker.name.findName(),
			list_description: 'Just a description.',
			from_name: faker.name.findName(),
			from_email: "gourav.pwd@cisinlabs.com",
			reply_email: "mohammad.z@cisinlabs.com"
		});
	}
	return generatedData;
}

const subscriberList = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: 'List',
			description: 'New list',
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const createSegments = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			segment_name: faker.name.findName(),
			segment_description: 'Just a description.'
		});
	}
	return generatedData;
}

const subscriberEmail = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			email: 'hareram.p@cisinlabs.com',
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const todoSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: 'Todo name',
			startTime: faker.date.past(),
			is_complete: 0,
			priority: 1,
			completed_date: new Date()
		});
	}
	return generatedData;
}

const categorySampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: 'category name'
		});
	}
	return generatedData;
}

const emailTemplateData = (number, type) => {
	const templateType = type;
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			template_type: `${templateType}`,
			template: {
				newEmailName: `Test ${templateType} template`,
				emailOptions: {
					paddingTop: "10",
					paddingRight: "10",
					paddingBottom: "10",
					paddingLeft: "10",
					backgroundColor: "#273142",
					font: {
						family: "Tahoma, Geneva, sans-serif",
						size: 16,
						weight: "normal",
						color: "#4d4d4d"
					},
					direction: "ltr",
					width: 600
				},
				elements: [{
					type: "button",
					defaults: {
						align: "center",
						padding: ["12", "20", "12", "20"],
						margin: ["15", "15", "15", "15"],
						buttonText: "Click me",
						url: "#",
						buttonBackgroundColor: "#3498DB",
						backgroundColor: "#ffffff",
						border: {
							"size": 1,
							"radius": 3,
							"color": "#3498DB",
							"style": "solid"
						},
						"fullWidth": false,
						"font": {
							"family": "Tahoma, Geneva, sans-serif",
							"size": 15,
							"weight": "normal",
							"color": "#ffffff"
						},
						"compiledHtmlString": "<ripple-button _nghost-c27=\"\" style=\"text-align: center; background-color: rgb(255, 255, 255); padding: 15px; display: block;\" class=\"ng-star-inserted\"><button _ngcontent-c27=\"\" type=\"button\" style=\"padding: 12px 20px; background-color: rgb(52, 152, 219); font-family: Tahoma, Geneva, sans-serif; font-style: normal; font-weight: normal; font-size: 15px; color: rgb(255, 255, 255); border: 1px solid rgb(52, 152, 219); border-radius: 3px;\"> Click me\n</button></ripple-button>"
					},
					"id": "id1555939300816RAND82772"
				},
				{
					type: "rawHtml",
					defaults: {
						"html": ""
					},
					id: "id1555939300817RAND75479"
				}
				]
			}
		});
	}
	return generatedData;
}

const eventSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			title: faker.name.findName(),
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const eventRepeatsData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			repeat_type: 'nome',
			repeat_for: 'todo',
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const eventRecipientSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const todoContactSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const timezoneData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			key: "Pacific/Pago_Pago",
			value: "(GMT-11:00) Pago Pago"
		});
	}
	return generatedData;
};

const accountsSampleData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			name: faker.name.findName(),
			timezone_id: null,
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}
	return generatedData;
}

const permissionsData = (number) => {
	generatedData = []
	for (let i = 0; i < number; i++) {
		generatedData.push({
			permission: faker.name.findName(),
			is_custom: 0,
			is_section: 0,
			created_at: faker.date.past(),
			updated_at: faker.date.past()
		});
	}

	generatedData.push({
		permission: faker.name.findName(),
		custom_field_id:1,
		is_custom: 1,
		created_at: faker.date.past(),
		updated_at: faker.date.past()
	});
	return generatedData;
}


module.exports = {
	createdSampleData
};
