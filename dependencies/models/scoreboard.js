const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function scoreboard(opp, spec) {
    const scoreboardSchema = new Schema({

            user: {type: Schema.Types.ObjectId, ref: 'user' , index:true},

            username: {type: String},

            score: {type: Number, default: 0},

            opportunities: {type: Number, default: opp},

            played: {type: Number, default: 1},

            avatar:{type:String},

            createdAt: {type: Date},

            updatedAt: {type: Date}

        }, {collection: spec}
    );

    scoreboardSchema.index({score: -1, updatedAt: 1});
    return scoreboardSchema;
}

module.exports = scoreboard;