const {dbUrl} = require('./db/dbConfig');
const debug = require('debug')('Mondb:');

const mongoose = require('mongoose');


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

// require('./dependencies/models/user');
// require('./models/auth');
// require('./models/game');
require('./db/models/league');
require('./db/models/admin');

// require('./models/boxTransaction');
// require('./models/toPay');
// require('./models/box');
// require('./models/avatar');

const League = mongoose.model('league');
const Admin = mongoose.model('admin');

const scoreboardSchema = require('./db/models/scoreboard');

//mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000}).then(() => {
mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000,replicaSet: 'rs0', useUnifiedTopology: true}).then(() => {

    League.find((err, leagues) => {
        if(err) {
            debug(err);
        }
        if (!err)
            leagues.forEach((item => {
                mongoose.model(item.collectionName, scoreboardSchema(item.dafaultOpportunities,item.collectionName))
            }));
        debug('database connected :)');
        createSuperAdmin().then(()=> {
            console.log('done');
        });
    });

}).catch((err) => {
    debug(err);
});


async function createSuperAdmin ()
{
    const admin = new Admin({
        username: 'pooriya',
        password: 'Playwin@2019',
        name: 'pooriya babaei',
        email: 'pooriya.babaei.1997@gmail.com',
        phone: '09139236452',
        role: 'superadmin'

    });
   await admin.save();
   return true
}
async function f() {


    var st = Date.now();
    var Scoreboard = mongoose.model('superleague');
    for (let i = 0; i < 600000; i++) {
        var record = new Scoreboard(
            {
                user: '5cd48dbf6b63f015483125a1',
                username: 'nabi',
                score: Math.floor(Math.random() * 10000),
                opportunities: i,
                avatar: Math.floor(Math.random() * 3)

            }
        );
       await record.save();
    }
    var en = Date.now();
    console.log(en - st);
}

