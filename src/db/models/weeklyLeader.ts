import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const weeklyLeaderSchema = new Schema({

    user: {type: Schema.Types.ObjectId, ref: 'user' , index:true},

    coins: {type: Number, default: 0, index:true},

    createdAt: {type: Date, default: Date.now, expires: 60 * 60 * 24 * 7}

});

export default mongoose.model('weeklyLeader', weeklyLeaderSchema);