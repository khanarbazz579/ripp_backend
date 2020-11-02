// const User = require('../../models').users;
// const UserDetail = require('../../models').user_details;

// const path = require('path');
// const multerS3UserProfile = require('../../services/multerS3UserProfile');

// const update = async function (req, res) {

//     let data = req.body;

//     if(req.file){
//         if(data.old_image_name){
//             let path = `user-profile-image/${data.old_image_name}`;

//             let promise = await multerS3UserProfile.deleteProfileImageFromAws(path);  
//             if(promise){
//                 console.log("++++++++++++++++++++ DELETED", promise)
//             }  
//         }
//     }

//     multerS3UserProfile.uploadSingleImage(req.file, req.params, async (response) => {
//         if(response){
//             data.profile_image = path.basename(response);
//         }
//         if (data.birth_date) {
//             const dateParts = data.birth_date.split('/');
//             const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
//             data.birth_date = date.toISOString();
//         }

//         let userId = req.params.id;

//         let [err, user] = await to(User.findByPk(userId));

//         if (user) {
//             if (data.password && data.current_password) {
//                 [err, user] = await to(user.comparePassword(data.current_password));
//                 if (err) {
//                     return res.json({ success: false, message: 'Password is not valid' });
//                 }
//             }
//             user.set(data);
//             [err, user] = await to(user.save());
//             if (err) {
//                 if (err.message == 'Validation error') err = 'The email address or phone number is already in use';
//                 return ReE(res, err);
//             }

//             let user_custom_fields = JSON.parse(data.user_custom_fields)

//             user_custom_fields.forEach( (field) => {
//                 let insertedData = {
//                     custom_field_id: field.custom_field_id,
//                     field_value: field.field_value,
//                     user_id: req.user.id,
//                 }
//                 let savedDetail = insertDetail(insertedData);
//             })

//             return ReS(res, { message: 'Updated User: ' + user.email, profile_image: data.profile_image }, 200);
//         }else{
//             return ReE(res, { message: "user does not exist" }, 422);
//         }
//     });

// }

// const insertDetail = async (insertedData) => {

//     let err, detailObj;
//     [err, detailObj] = await to(UserDetail.findOrCreate({
//             where: {
//                 custom_field_id: insertedData.custom_field_id,
//                 user_id: insertedData.user_id
//             },
//             defaults: insertedData
//         }).spread(async(detailedObj, created) => {
//             if (!created) {
//                 [err, detailObj] = await to(detailedObj.update(insertedData))
//             }
//         })
//     );

//     return detailObj;
// } 

// module.exports.update = update;