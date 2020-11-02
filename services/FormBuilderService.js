const models = require('../models');
const bcrypt = require('bcrypt');
const { havePermission } = require('./PermissionService');

module.exports = class FormBuilderService {

	/**
	 * Saves a new form.
	 * 
	 * @param  {Object} body
	 * @param  {Number} userId
	 * 
	 * @return {Promise}
	 */
	async saveForm(body, userId) {

		if(!body.form_name) {
			throw new Error('Please specify form name!');
		}

		if(!body.type) {
			throw new Error('Please specify whether form is existing or new!');
		}

		if(!body.user_type || !body.sales_stage_id) {
			throw new Error('Please specify user mappings!');
		}

		if(!body.owner_mappings || (body.owner_mappings && !body.owner_mappings.length)) {
			throw new Error('Please add map a record owner to the new added users!');
		}

		const salt = await bcrypt.genSalt(10);
        const hash = bcrypt.hashSync(Date.now() + body.form_name, salt);

		let form = await models.forms.create({
			user_id: userId,
			form_id: hash,
			form_name: body.form_name,
			status: true,
			type: body.type,
			sales_stage_id: body.sales_stage_id,
			user_type: body.user_type,
		});

		if(!form) {
			throw new Error('Cannot create the form at the moment!');
		}

		body.owner_mappings.map(user => {
			models.form_owner_mappings.create({
				user_id: user.id,
				form_id: form.id,
				type: user.type,
				access: user.access || ''
			})
		})

		return form.reload();
	}

	/**
	 * Fetches all forms from the table.
	 * 
	 * @param  {Object} query
	 *
	 * @throws {Error}
	 * @return {Object}
	 */
	async getForms(query = {}) {
		let where = {}, order = [], opts = {} ;

		if(query.id) {
			return models.forms.findOne({
				where: {id: query.id},
				include: [ {
					model: models.form_field_mappings,
					as: 'field_mappings',
					include: [{
						model: models.custom_fields,
						attributes: ['model_name', 'additional_attribute', 'label', 'id', 'type', 'placeholder', 'help_text', 'control_type', 'is_hidden'],
						as: 'custom_field'
					}],
					order:[['order', 'asc']]
				}, {
					model: models.form_owner_mappings,
					as: 'owner_mappings',
					include: [{
						model: models.users,
						as: 'user',
						attributes: ['first_name', 'last_name', 'id']
					}]
				}]
			});
		}

		if(query.sort) {
			if(query.sort.field === 'user_id') {
				order.push([{model: models.users, as: 'owner'}, 'id', query.sort.order]);
			} else {
				order.push([query.sort.field, query.sort.order]);
			}
		}

		let total = await models.forms.count();

		opts = {
			where,
			include: [{
				model: models.users,
				as: 'owner',
				attributes: ['first_name', 'last_name', 'id']
			}],
			order
		}

		let filtered = await models.forms.count(opts);

		if(query.paginate) {
			opts.limit = query.paginate.limit;
			opts.offset = query.paginate.offset;
		}

		let rows = await models.forms.findAll(opts);

		return {
			rows,
			paginate: {
				...query.paginate,
				filtered,
				total
			}
		}
	}

	/**
	 * Updates a form by ID
	 * 
	 * @param  {Number} id
	 * @param  {Object} data
	 *
	 * @throw {Error}
	 * @return {Object}
	 */
	async updateForm(id, data) {
		let form = await models.forms.findOne({
			where: {
				id
			}
		});

		if(!form) {
			throw new Error('No such form exists!');
		}

		if(data.status !== null) {
			form.status = data.status;
		}

		if(data.verified !== null) {
			form.verified = data.verified;
		}

		if(data.fields_mapped !== null) {
			form.fields_mapped = data.fields_mapped;
		}

		if(data.form_name) {
			form.form_name = data.form_name;
		}

		if(data.type) {
			form.type = data.type;
		}

		if(data.sales_stage_id) {
			form.sales_stage_id = data.sales_stage_id;
		}

		if(data.user_type) {
			form.user_type = data.user_type;
		}

		if(data.owner_mappings) {
			this._saveFormOwners(data.owner_mappings, form.id);
		}

		if(data.field_mapping_buffer) {
			form.field_mapping_buffer = data.field_mapping_buffer
		}

		if(data.field_mappings && data.field_mappings.length) {
			await this._mapFormFields(form.id, data.field_mappings);
		}

		if(!await form.save()) {
			throw new Error('Cannot update this form at the moment!');
		}

		return form.reload({
			include: [ {
				model: models.form_field_mappings,
				as: 'field_mappings',
				include: [{
					model: models.custom_fields,
					attributes: ['model_name', 'additional_attribute', 'label', 'id', 'type', 'placeholder', 'help_text', 'control_type', 'is_hidden'],
					as: 'custom_field'
				}],
				order:[['order', 'asc']]
			}, {
				model: models.form_owner_mappings,
				as: 'owner_mappings',
				include: [{
					model: models.users,
					as: 'user',
					attributes: ['first_name', 'last_name', 'id']
				}]
			}]
		});
	} 

	/**
	 * Searches user with query.
	 * 
	 * @param  {Object} query
	 * @return {Array}
	 */
	searchUsers(query) {
		
		let where = [];

		if(query.search) {
			where.push(models.Sequelize.literal(
				` concat_ws(' ',first_name,last_name) like '%${query.search}%'`)
			);
		}

		if(query.where && query.where.id) {
			where = [{
				id: {
					$in: query.where.id
				}
			}];
		}

		if(query.selected && query.selected.length) {
			where.push({
				id:{
					$notIn: query.selected
				}
			})
		}

		return models.users.findAll({
			attributes: ['first_name', 'last_name', 'id'],
			where: {
				$and: where
			},
			limit: query.limit || 20
		})
		.then(docs => {
			let permissions = ['leads custom fields'];

			if(query.permissions && query.permissions.type) {
				if(query.permissions.type.toLowerCase() === 'lead') {
					permissions.push('add new leads');
					permissions.push('edit leads');
				}

				if(query.permissions.type.toLowerCase() === 'client') {
					permissions.push('add new clients');
					permissions.push('edit clients');
				}

				if(query.permissions.type.toLowerCase() === 'supplier') {
					permissions.push('add new suppliers');
					permissions.push('edit suppliers');
				}

				if(query.permissions.type.toLowerCase() === 'both') {
					permissions.push('add new leads');
					permissions.push('edit leads');
					permissions.push('add new clients');
					permissions.push('edit clients');
				}
			}

			return docs.filter(async doc => {
				return await havePermission({
	                permission: permissions,
	                user: doc
	            });
			});
		})
	}

	/**
	 * Gets initial data required for adding a form.
	 * 
	 * @param  {Object} query
	 *
	 * @throw {Error}
	 * @return {Object}
	 */
	async getInitData(query) {
		let salesStages = await models.sales_stages.findAll({
			attributes: ['id', 'name', 'for']
		}); 

		let fields = await models.custom_fields.findAll({
			attributes: ['model_name', 'additional_attribute', 'label', 'id', 'type', 'placeholder', 'help_text', 'control_type', 'is_hidden']
		});

		return { salesStages, fields };
	}

	/**
	 * Mutates field mappings data.
	 * 
	 * @param  {Array} field
	 * @return {Array}
	 */
	async _mutateMappings(field) {

		if(field.dataValues.custom_field && field.dataValues.custom_field.dataValues.additional_attribute) {
			try {
				field.dataValues.custom_field.dataValues.additional_attribute = JSON.parse(field.dataValues.custom_field.dataValues.additional_attribute);
			} catch(err) {
				field.dataValues.custom_field.dataValues.additional_attribute = {};
			}
		}

		let ret = {
			...field.dataValues,
			...(field.dataValues.custom_field && field.dataValues.custom_field.dataValues)
		};

		if(ret.custom_field && ret.custom_field.control_type === 'country_dropdown') {
			ret.additional_attribute = await models.countries.findAll({
				attributes:[['name', 'key'], ['id', 'value']],
				raw: true
			});
		}

		delete ret.custom_field;
		return ret;
	}

	/**
	 * Public data for the form.
	 * 
	 * @param  {Object} query
	 *
	 * @throw {Error}
	 * @return {Object}
	 */
	async getPublicForm(query) {

		if(!query.id) {
			throw new Error('Invalid request!');
		}

		let form = await models.forms.findOne({
			where: {
				form_id: query.id,
				status: 1
			},
			attributes: ['form_name', 'id', 'form_id', 'type', 'fields_mapped', 'verified'],
			include: [ {
				model: models.form_field_mappings,
				as: 'field_mappings',
				include: [{
					model: models.custom_fields,
					attributes: ['model_name', 'additional_attribute', 'label', 'id', 'type', 'placeholder', 'help_text', 'control_type', 'is_hidden'],
					as: 'custom_field'
				}],
				order:[['order', 'asc']]
			}]
		});

		if(!form) {
			throw new Error('Either form doesn\'t exists or is invalid!');
		}

		for(let i = 0 ; i < form.dataValues.field_mappings.length ; i++) {
			form.dataValues.field_mappings[i] = await this._mutateMappings(form.dataValues.field_mappings[i]);
		}
		
		form.dataValues.columns = {
			one: form.dataValues.field_mappings
				.filter(field => field.column === 1)
				.sort((a, b) => a.order - b.order),
			two: form.dataValues.field_mappings
				.filter(field => field.column === 2)
				.sort((a, b) => a.order - b.order)
		};

		delete form.dataValues.field_mappings;
		return form.dataValues;
	}

	/**
	 * Adds/updates form field mappings with the input fields.
	 * 
	 * @param  {Number} form_id
	 * @param  {Array} fields
	 * 
	 * @return {Array}
	 */
	async _mapFormFields(form_id, fields) {

		let removed = fields.map(field => field.custom_field_id).filter(field => !!field);

		await models.form_field_mappings.destroy({
			where:{
				custom_field_id: {
					$notIn: removed
				},
				form_id
			}
		});

		for(let i = 0 ; i < fields.length ; i++) {
			let field = fields[i];
		
			let row = await models.form_field_mappings.findOne({
				where: {
					form_id: form_id,
					input_name: field.input_name
					// custom_field_id: field.custom_field_id
				}
			});

			// if(!field.custom_field_id && row) {
			// 	await row.destroy();
			// }

			if(row) {
				await row.update({
					order: field.order || 0,
					column: field.column || 1,
					custom_field_id: field.custom_field_id || 0,
					field_attributes: field.field_attributes || {},
					styles: field.styles || {},
					input_name: field.input_name
				});
			} else {
				await models.form_field_mappings.create({
					order: field.order || 0,
					column: field.column || 1,
					custom_field_id: field.custom_field_id || 0,
					field_attributes: field.field_attributes || {},
					styles: field.styles || {},
					input_name: field.input_name,
					form_id
				});
			}
		}
	}

	/**
	 * Saves owners for the form.
	 * 
	 * @param  {Array} users
	 * @param  {Number} form_id
	 * @param  {String} type
	 * 
	 * @return {Promise}
	 */
	async _saveFormOwners(users, form_id) {

		await models.form_owner_mappings.destroy({
			where: {
				form_id
			}
		});

		// if(type === 'OWNER') {
		// 	return models.form_owner_mappings.create({
		// 		user_id: users,
		// 		form_id: form_id,
		// 		type: 'OWNER'
		// 	});
		// }

		return users.map(user => {
			models.form_owner_mappings.create({
				user_id: user.id,
				form_id: form_id,
				type: user.type,
				access: user.access
			});
		});
	}

	/**
	 * Saves form submission values
	 * 
	 * @param  {Object} body
	 * @return {Object}
	 */
	async saveFormValues(body) {

		if(!body.form_id) {
			throw new Error('Invalid form!');
		}

		let input_name = Object.keys(body.fields);

		// check if the form exists
		let form = await models.forms.findOne({
			where: {
				id: body.form_id,
				status: true
			}
		});

		if(!form) {
			throw new Error("Form is disabled, please contact administrator!");
		}

		// create submission instance
		let submission = await models.form_submissions.create({
			form_id: body.form_id,
			analytic_app_id: body.app_id || 0,
			analytic_app_user_id: body.user_id || 0
		});

		if(!submission) {
			throw new Error('Cannot save the form details at the moment!');
		}
		
		// Attach values to the submission
		let fields = await models.form_field_mappings.findAll({
			where: {
				input_name: {
					$in: input_name
				}
			},
			attributes: ['input_name', 'id', 'custom_field_id'],
			raw: true
		});		

		for(let i = 0 ; i < fields.length ; i++ ) {
			let field = fields[i];			
			let create = {
				form_field_mapping_id: field.id,
				value: body.fields[field.input_name],
				custom_field_id: field.custom_field_id,
				form_submission_id: submission.id
			}

			await models.form_submission_values.create(create);
		}

		return submission.reload({
			attributes:['id', 'analytic_app_id', 'analytic_app_user_id']
		});
	}

	/**
	 * Removes the form with relations data.
	 * 
	 * @param  {Number} id 
	 * @return {Promise}
	 */
	async destroy(id) {

		if(isNaN(parseInt(id))) {
			throw new Error('Please send a valid form identifier!');
		}

		return await models.sequelize.transaction(async (t) => {

		    await models.forms.destroy({
		      where: { id }
		    }, { transaction: t });

		    await models.form_field_mappings.destroy({
		      where: { form_id: id }
		    }, { transaction: t });

		    await models.form_owner_mappings.destroy({
		      where: { form_id: id }
		    }, { transaction: t });

		    models.form_submissions.findAll({
		    	where: {
		    		form_id: id
		    	}
		    }, { transaction: t })
		    .then(docs => {
		    	docs.map(async doc => {
		    		await models.form_submission_values.destroy({
		    			where: {
		    				form_submission_id: doc.id
		    			}
		    		}, { transaction: t });
		    	});
		    });

		    await models.form_submissions.destroy({
		    	where: {
		    		form_id: id
		    	}
		    }, { transaction: t })

		    await models.form_owner_mappings.destroy({
		      where: { form_id: id }
		    }, { transaction: t });

		    return true;
	  	});
	}
}