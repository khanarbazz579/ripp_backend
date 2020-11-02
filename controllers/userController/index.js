const { createUser, update, get } = require('../../services/userService');
const { deleteUser } = require('../../services/userRelocateDeleteService');
const { checkIsOldPasswordIsValid } = require('../../services/AuthService');

module.exports = (function () {

    this.createUser = async ({ body, headers, file }, res, next) => {
        try {
            return ReS(res, await createUser(body, file, headers), 200);
        } catch (err) {
            return ReE(res, err.message.replace(/(Error: )+/gm, ''), 422);
        }
    }

    this.get = async ({ params: { _id } }, res, next) => {
        try {
            return ReS(res, { payload: await get(_id) }, 200);
        } catch (err) {
            return ReE(res, err.message.replace(/(Error: )+/gm, ''), 422);
        }
    }

    this.update = async (req, res, next) => {
        try {
            return ReS(res, { payload: await update(req) }, 200);
        } catch (err) {
            return ReE(res, err.message.replace(/(Error: )+/gm, ''), 201);
        }
    }

    this.deleteUser = async (req, res, next) => {
        try {
            return ReS(res, { payload: await deleteUser(req) }, 200);
        } catch (err) {
            return ReE(res, err.message.replace(/(Error: )+/gm, ''), 422);
        }
    }

	/**
	  *@param Object req
	  *@param Object res
	  *@param Function next
	*/
    this.checkIsOldPasswordIsValid = async (req,res,next)=> {
		try{
		  let oldPassword = req.body.old_password;
		  let userId = req.user.id;
		  return ReS(res, { payload: await checkIsOldPasswordIsValid(oldPassword,userId) }, 200);
		} catch (err) {
			return ReE(res, err.message.replace(/(Error: )+/gm, ''), 201);
		}  
	}

    return this;
})();