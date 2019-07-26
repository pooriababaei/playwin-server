const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const debug = require('debug')('Auth Model:');

const authSchema = new Schema({

    phoneNumber: {type: String, required: true},

    authToken: {type: Number},

    createdAt: {type: Date, default: Date.now, expires: 90}  //90 seconds

}, {collection: 'auth'});

authSchema.statics.authenticate = function (phoneNumber, authToken) {
    let Auth = this;
    debug(phoneNumber);
    const user = {
        phoneNumber: phoneNumber,
        authToken: authToken
    };

    return Auth.findOne(
        {...user}, (err, res) => {
            if (err) debug('err');
            if (res)
                return Promise.resolve(res);

            else if (!res)
                return Promise.resolve();

        });
};

authSchema.pre('save', function (next) {
    let user = this;
    user.authToken = Math.floor(Math.random() * (999999 - 100000) + 100000);
    next();
});

module.exports = mongoose.model('auth', authSchema);