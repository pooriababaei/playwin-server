const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boxSchema = new Schema({

    name: {type: String},

    price: {type: Number},

    offPrice: {type: Number},

    oppos:{type:Number},

    loyalties:{type:Number},

    end_time:{type:Date},

    image: {type:String},
});

module.exports = mongoose.model('box', boxSchema);
