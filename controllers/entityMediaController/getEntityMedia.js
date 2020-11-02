const db = require('../../models');
const EntityFiles = db.entity_files;
const FileCategory = db.file_categories;
const User = db.users;
const Contact = db.contacts;
const ContactEntityFile = db.contact_entity_files;
const commonFunction = require('../../services/commonFunction');
const Sequelize = require('sequelize')

const getEntityFilesData = async (req, res) => {

	let whereFilter = req.body.whereFilter;
	let orderFilter = req.body.orderFilter;
	let offsetFilter = req.body.offsetFilter ? req.body.offsetFilter : 0;

	if(orderFilter && orderFilter.type){
		if( orderFilter.type == "file_categories"){
			orderFilter = [ 
				[  db[orderFilter.type], 'name', orderFilter.filterType ],
			]	
		}else if(orderFilter.type == "contacts"){
			orderFilter = [ 
				[ db.sequelize.literal('contactCount'), orderFilter.filterType ]
			]	
		}
	}

	let [err, data] = await to(
		EntityFiles.findAll({
			attributes:[
				'id', 'name', 'size', 'path', 'icon_path', 'mimetype', 'extension_type', 'height', 'width', 'aspect_ratio', 'file_category_id', 'entity_type', 'entity_id', 'created_by', 'created_at',
				[db.sequelize.literal('(SELECT COUNT(*) FROM contact_entity_files WHERE contact_entity_files.entity_file_id = entity_files.id)'), 'contactCount'],
			],
			where: whereFilter,
			include: [
				{
					attributes: ['first_name', 'last_name'],
					model: User
				},
				{
					attributes: ['name'],
					model: FileCategory
				},
				{
					attributes: ['id'],
					model: ContactEntityFile,
					as: 'associate_contacts',
					include:[{
						attributes: ['first_name', 'last_name', 'id', 'email'],
						model: Contact,
						as: 'contact'
					}]
				},
			],
			order: orderFilter,
			offset:offsetFilter,
			limit: 10
		}).map(el => el.get({
            plain: true
        }))
	);

	let singleContacts = [], multipleContacts = [], noContacts = [];

	if(data){	
		data.forEach( (file) => {
			file['size'] = commonFunction.mediaCommonFunction.formatBytes(file.size || 0);
			file['isImage'] = (S3_MEDIA.allowed_image_file_extensions.indexOf(file['mimetype']) > -1) ? 1 : 0;
			
			if(req.body.orderFilter.type && req.body.orderFilter.type == "contacts"){
				if(file['contactCount'] == 1){
					singleContacts.push(file);
				}else if(file['contactCount'] > 1){
					multipleContacts.push(file);
				}else{
					noContacts.push(file);
				}
			}
		});

		if(req.body.orderFilter.type == "contacts"){
			data = await getFilteredAccordingToContact(singleContacts, multipleContacts, noContacts, req.body.orderFilter.filterType)
		}
	}

	if (err) {
      	return ReE(res, err, 422);
  	}

	if (data) {
		return res.json({ success: true, message: 'Files received', files: data });
	}
} 

const getFilteredAccordingToContact = async(singleContacts, multipleContacts, noContacts, type) => {
	singleContacts.sort(function (a, b) {
		if(type == 'DESC'){
			return a.associate_contacts[0].contact.fullName < b.associate_contacts[0].contact.fullName
		}
 		return a.associate_contacts[0].contact.fullName > b.associate_contacts[0].contact.fullName
	});
	multipleContacts.sort(function (a, b) {
		if(type == 'DESC'){
			return b.contactCount - a.contactCount
		}
		return a.contactCount - b.contactCount
	});

	if(type == 'ASC')
		return [ ...singleContacts, ...multipleContacts, ...noContacts ]

	return [ ...multipleContacts, ...singleContacts, ...noContacts ]
}

module.exports = getEntityFilesData;
