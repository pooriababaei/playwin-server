import Debug from 'debug';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const debug = Debug('Auth Model:');

const authSchema = new Schema({

    phoneNumber: {type: String, required: true},

    authToken: {type: Number},

    createdAt: {type: Date, default: Date.now, expires: 90}  // 90 seconds

}, {collection: 'auth'});

authSchema.statics.authenticate = function(phoneNumber, authToken) {
    let Auth = this;
    const user = {
        phoneNumber: phoneNumber,
        authToken: authToken
    };

    return Auth.findOne(
        {...user}, (err, res) => {
            if (err) { debug('err'); }
            if (res) {
                return Promise.resolve(res);
            }
            else if (!res){
                return Promise.resolve();
            }

        });
};
authSchema.pre('save', function(next) {
    this.authToken = Math.floor(Math.random() * (99999 - 10000) + 10000);
    return next();
});

export default mongoose.model('auth', authSchema);