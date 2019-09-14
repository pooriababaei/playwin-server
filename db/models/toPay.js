const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const toPaySchema = new Schema({

    user: {type: Schema.Types.ObjectId, ref: 'user'},

    amount:{type: Number , required : true , index : true},

    paid: {type: Boolean, default : false , index : true},

    payTime : {type: Date},

    paymentNumber: {type: Number}

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt:'updatedAt'
    }
    });
toPaySchema.index({createdAt:1});
toPaySchema.plugin(AutoIncrement, {inc_field: 'paymentNumber'});
module.exports = mongoose.model('toPay', toPaySchema);