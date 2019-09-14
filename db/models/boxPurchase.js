const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boxPurchaseSchema = new Schema({

    user: {type: Schema.Types.ObjectId, ref: 'user', index:true},

    authority: {type: String},

    amount: {type:Number, required:true},

    refId: {type:String},

    box: {type: Schema.Types.ObjectId, ref: 'box'},

}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt:'updatedAt'
    }
});

 boxPurchaseSchema.virtual('id').get(function () {
     return this._id;
 });
module.exports = mongoose.model('boxPurchase', boxPurchaseSchema);