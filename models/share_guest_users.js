'use strict';
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const share_guest_user = sequelize.define('share_guest_users', {
    first_name: {
      type: DataTypes.STRING(191),
      field: 'first_name'
    },
    last_name: {
      type: DataTypes.STRING(191),
      field: 'last_name'
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: {
          msg: "Email number invalid."
          
        }
      }
    },
    password: DataTypes.STRING(191),
    status: DataTypes.TINYINT,
    is_confirm: DataTypes.TINYINT,
    reference_id:DataTypes.INTEGER,
    url_token: DataTypes.STRING,
    email_verification_token: DataTypes.STRING,
    
  }, {
      underscored: true,
      getterMethods: {
        fullName() {
          let firstName = this.getDataValue('first_name');
          let lastName = this.getDataValue('last_name');

          return firstName + " " + lastName;
        }
      }
    });
  share_guest_user.associate = function (models) {
    // associations can be defined here
  };

  // share_guest_user.beforeSave(async (user, options) => {
  //   let err;
  //   if (user.changed('password')) {
  //     let salt, hash;

  //     [err, salt] = await to(bcrypt.genSalt(10));
  //     if (err) TE(err.message, true);

  //     [err, hash] = await to(bcrypt.hash(user.password, salt));
  //     if (err) TE(err.message, true);

  //     user.password = hash;
  //   }
  // });

  share_guest_user.prototype.comparePassword = async function (pw) {
    let err, pass;
    if (!this.password) TE('password not set');
    
    [err, pass] = await to(bcrypt_p.compare(pw, this.password));

    if (err) TE(err);
    
    if (!pass) TE('Invalid password');
    
    return this;
  };

  share_guest_user.prototype.getJWT = function () {
    let expiration_time = parseInt(CONFIG.jwt.expiration);
    return "Bearer " + jwt.sign({ user_id: this.id, user_type: 'SHARED_GUEST' }, CONFIG.jwt.encryption, { expiresIn: expiration_time });
  };

  share_guest_user.prototype.toWeb = function (pw) {
    let json = this.toJSON();
    return json;
  };

  share_guest_user.prototype.getForgetPasswordToken = async function (email) {
    
    let salt, hash, err;

    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) TE(err.message, true);

    [err, hash] = await to(bcrypt.hash(email, salt));
    if (err) TE(err.message, true);

    hash = hash.replace(/\//g, '');
    
    return hash;

    //return crypto.createHash('md5').update(new Date().toString()).digest("hex");
  };

  return share_guest_user;
};