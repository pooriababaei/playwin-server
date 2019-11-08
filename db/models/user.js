const fs = require('fs');
const path = require('path')
const user_key = fs.readFileSync(path.join(__dirname, '../../keys/user_key')).toString();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const userSchema = new Schema({

    username: {type: String, required: true, unique: true, trim: true, set: toLower, index:true},

    invitingUsers: [{type: Schema.Types.ObjectId, ref : 'user'}],

    coins: {type: Number, default: 0, index : true},

    totalCoins:{type: Number, default: 0, index: true},

    coupons: {type: Number, default: 100},

    achievements: [{type: Schema.Types.ObjectId, ref : 'achievement'}],

    participatedLeagues: [{type: Schema.Types.ObjectId, ref: 'league'}],

    phoneNumber: {type: String, required: true, unique: true , index: true},

    account: {type: String},

    loyalties: {type: Number, default: 0, index : true},

    avatar: {type: String, default:'0'},

    appSource: {type: String}  //each number for an app source like :bazaar , playStore,directP


}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});
userSchema.index({createdAt:1});
function toLower(v) {
    return v.toLowerCase();
}


userSchema.methods.generateToken = function () {
    let user = this;
    return jwt.sign({
        _id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        avatar:user.avatar,
        role: 'user'
    }, user_key).toString();
};

userSchema.statics.findByUsername = function (username, password) {
    const User = this;

    return User.findOne({username}).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject(err);
                }
            });
        });
    });
};


module.exports = mongoose.model('user', userSchema);