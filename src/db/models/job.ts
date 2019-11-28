import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const jobSchema = new Schema({

    property: {type: String , required: true},

    type: {type: String, enum : ['reward', 'startLeague-announcment'] , required: true},

    fireTime: {type: Date , required: true},

    processOwner: {type: Number },
});
jobSchema.index({property: 1 , type: 1}, {unique: true});

export default mongoose.model('job', jobSchema);
