import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const gameSchema = new Schema({

    name: {type: String, minLength: 3 , required : true},

    description: {type: String},

    available: {type: Boolean, default: false},

    images: [{type: String}],

    mainImage: {type: String, required: true},

    gif: {type: String},

    game: {type: String},

    html:{type: String},

    gameZip : {type :String},

    baseColor : {type: String},

    secondaryColor : {type: String}
});

/*gameSchema.pre('save', function (next) {
    let game = this;
    next();
});*/

export default mongoose.model('game', gameSchema);