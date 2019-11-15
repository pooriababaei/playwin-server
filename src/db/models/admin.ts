import bcrypt from "bcrypt";
import fs from 'fs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
//const admin_key = fs.readFileSync(path.join(__dirname, '../../keys/admin_key')).toString();
const Schema = mongoose.Schema;
const adminSchema: any = new Schema({

    username: {type: String, required: true, unique: true, trim: true, set: toLower},

    name: {type: String, required: true},

    password: {type: String, required: true, minLength: 6, },

    email: {type: String, required: true, unique: true, trim: true, set: toLower},

    phone: {type: String, required: true},

    image:{type:String},

    resetPasswordToken: {type: String},

    resetPasswordExpires: {type: Date},

    role: {type:String, enum : ['admin','superadmin'], default: 'admin'}
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

function toLower(v) {
    return v.toLowerCase();
}

adminSchema.methods.generateToken = () => {
    let admin = this;
    return jwt.sign({
        _id: admin._id,
        username: admin.username,
        phoneNumber: admin.phoneNumber,
        email: admin.email,
        role: admin.role
    }, process.env.ADMIN_KEY).toString();
};

adminSchema.statics.findByUsername = (username, password) => {
    const Admin = this;

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
adminSchema.statics.findByEmail = (email, password) => {
    const Admin = this;
    return Admin.findOne({email}).then((admin) => {
        if (!admin) {
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

export default mongoose.model('admin', adminSchema);