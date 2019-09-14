const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const boxSchema = new Schema({

    name: {type: String , required:true},

    type:{type : Number},

    price: {type: Number , required:true},

    offPrice: {type: Number},

    coupons:{type:Number},

    endTime:{type:Date},

});

module.exports = mongoose.model('box', boxSchema);
