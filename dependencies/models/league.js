const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const leagueSchema = new Schema({

    name: {type: String, minLength: 3},

    spec: {type: String,unique:true},

    description: {type: String},

    kind: {type: Number},

    leadersNumber: {type :Number,default:0},

    awardCoinsNumber: {type:Number,default:0},

    loyaltyGivensNumber: {type:Number, default:0},

    awardLoyaltyNumber:{type:Number, default:0},

    awardsDone : {type: Boolean, default: false},

    default_opportunities: {type: Number, required : true} ,

    max_opportunities: {type: Number},

    start_date: {type: Date},

    end_date: {type: Date},

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

/*leagueSchema.virtual('id').get(function () {
    return this._id;
});*/

module.exports = mongoose.model('league', leagueSchema);