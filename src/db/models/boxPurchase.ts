import mongoose from 'mongoose';
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

boxPurchaseSchema.virtual('id').get(() => {
    return this._id;
 });
export default mongoose.model('boxPurchase', boxPurchaseSchema);