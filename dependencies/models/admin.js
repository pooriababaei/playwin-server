const fs = require('fs');
const path = require('path')
const admin_key = fs.readFileSync(path.join(__dirname, '../../keys/admin_key')).toString();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const adminSchema = new Schema({

    username: {type: String, required: true, unique: true, trim: true, set: toLower},

    name: {type: String, required: true},

    email: {type: String, required: true, unique: true, trim: true, set: toLower},

    phoneNumber: {type: Number, required: true},


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


module.exports = mongoose.model('admin', adminSchema);