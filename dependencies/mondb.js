const {url, dbUrl, dbName} = require('./configDb');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url, {useNewUrlParser: true});
//const client = new MongoClient(url, {useNewUrlParser: true,replicaSet: 'rs'});
const debug = require('debug')('Mondb:');

const mongoose = require('mongoose');


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

require('./models/user');
require('./models/auth');
require('./models/game');
require('./models/league');
require('./models/boxTransaction');
require('./models/toPay');
require('./models/admin');
require('./models/box');
require('./models/avatar');

const League = mongoose.model('league');
const scoreboardSchema = require('./models/scoreboard');

mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000}).then(() => {
//mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000,replicaSet: 'rs'}).then(() => {

    League.find((err, leagues) => {
        if(err) {
            debug(err);
        }
        if (!err)
            leagues.forEach((item => {
                mongoose.model(item.spec, scoreboardSchema(item.default_opportunities,item.spec))
            }));
        debug('database connected :)')
    });

}).catch((err) => {
    debug(err);
});


module.exports = {
    client,
    dbName,
    mongoose
};













