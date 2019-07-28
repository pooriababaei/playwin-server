const fs = require('fs');
const path = require('path')
const admin_key = fs.readFileSync(path.join(__dirname, '../../keys/admin_key')).toString();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const adminSchema = new Schema({

    username: {type: String, required: true, unique: true, trim: true, set: toLower},

    name: {type: String, required: true},

    password: {type: String, required: true, minLength: 6},

    email: {type: String, required: true, unique: true, trim: true, set: toLower},

    phoneNumber: {type: Number, required: true},

    resetPasswordToken: {type: String},

    resetPasswordExpires: {type: Date}


}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

function toLower(v) {
    return v.toLowerCase();
}

adminSchema.methods.generateToken = function () {
    let admin = this;
    const token = jwt.sign({
        _id: admin._id,
        username: admin.username,
        phoneNumber: admin.phoneNumber,
        email: admin.email,
        role: 'admin'
    }, admin_key).toString();
    return token;

};

adminSchema.statics.findByUsername = function (username, password) {
    let Admin = this;

    return Admin.findOne({username}).then((admin) => {
        if (!admin) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and admin.password
            bcrypt.compare(password, admin.password, (err, res) => {
                if (res) {
                    resolve(admin);
                } else {
                    reject(err);
                }
            });
        });
    });
};
adminSchema.statics.findByEmail = function (email, password) {
    var Admin = this;

    return Admin.findOne({email}).then((admin) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, admin.password, (err, res) => {
                if (res) {
                    resolve(admin);
                } else {
                    reject();
                }
            });
        });
    });
};

adminSchema.pre('save', function (next) {
    let admin = this;

    if (admin.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(admin.password, salt, (err, hash) => {
                admin.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

adminSchema.virtual('id').get(function () {
    return this._id;
});


module.exports = mongoose.model('admin', adminSchema);