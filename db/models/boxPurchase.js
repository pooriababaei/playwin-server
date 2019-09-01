const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boxPurchaseSchema = new Schema({

    user: {type: Schema.Types.ObjectId, ref: 'user'},

    authority: {type: String},

    amount: {type:Number},

    refId: {type:String},

    box: {type: Schema.Types.ObjectId, ref: 'box'},

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt:'updatedAt'
    }
});

module.exports = mongoose.model('boxPurcahse', boxPurchaseSchema);