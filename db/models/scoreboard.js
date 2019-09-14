const mongoose = require('mongoose');
const Schema = mongoose.Schema;
function scoreboard(opp, collectionName) {
    const scoreboardSchema = new Schema({

            user: {type: Schema.Types.ObjectId, ref: 'user' , index:true},

            score: {type: Number, default: 0, index:true},

            opportunities: {type: Number, default: opp},

            played: {type: Number, default: 1},

            createdAt: {type: Date},

            updatedAt: {type: Date, index : true}

        }, {collection: collectionName}
    );

    scoreboardSchema.index({score: -1, updatedAt: 1});
    return scoreboardSchema;
}

module.exports = scoreboard;