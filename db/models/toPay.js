const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const toPaySchema = new Schema({

    user: {type: Schema.Types.ObjectId, ref: 'user'},

    coins:{type: Number},

    paid: {type: Boolean, deafault : false},

    transactionId: {type: 'String'}

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt:'updatedAt'
    }
    });
toPaySchema.index({createdAt:1});
module.exports = mongoose.model('toPay', toPaySchema);