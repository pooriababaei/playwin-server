const { dbUrl} = require('./dbConfig');
const mongoose = require('mongoose');
const debug = require('debug')('Mondb:');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
//mongoose.set('debug', true);
mongoose.Promise = global.Promise;

require('./models/user');
require('./models/admin');
require('./models/auth');
require('./models/game');
require('./models/league');
require('./models/box');
require('./models/boxPurchase');
require('./models/toPay');
require('./models/weeklyLeader');
require('./models/job');
const League = mongoose.model('league');
const scoreboardSchema = require('./models/scoreboard');

//mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000, useUnifiedTopology: true}).then(() => {
mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000, useUnifiedTopology: true , replicaSet: 'rs0', user: 'admin', pass: 'Playwin@2019', auth:{authSource:'admin'}}).then(() => {

    League.find((err, leagues) => {
        if(err) {
            debug(err);
        }
        if (!err)
            leagues.forEach((item => {
                mongoose.model(item.collectionName, scoreboardSchema(item.defaultOpportunities,item.collectionName))
            }));
        debug('database connected :)');
    });

}).catch((err) => {
    debug(err);
});


module.exports = {
    mongoose
};













