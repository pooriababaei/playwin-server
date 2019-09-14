const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const leagueSchema = new Schema({

    name: {type: String, minLength: 3 , required : true},

    collectionName: {type: String,unique:true},

    description: {type: String},

    kind: {type: Number , reuired :true},

    leadersNumber: {type :Number,default:0 , required : true},

    coinsReward: {type:Number,default:0 , required : true},

    loyaltiesGivens: {type:Number, default:0},

    loyaltiesReward:{type:Number, default:0},

    rewarded : {type: Boolean, default: false},

    defaultopportunities: {type: Number, required : true} ,

    maxopportunities: {type: Number},

    startTime: {type: Date},

    endTime: {type: Date},

    available: {type: Boolean, default: false}, // available to users

    gameHidden : {type: Boolean, default : false},

    images: [{type: String}],

    mainImage: {type: String, required: true},

    html:{type: String , rqeuired : true},

    gameZip : {type :String},

    color : {type: String},

});


// leagueSchema.virtual('id').get(function () {
//     return this._id;
// });

module.exports = mongoose.model('league', leagueSchema);