const {url, dbUrl, dbName} = require('./db/configDb');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url, {useNewUrlParser: true});
//const client = new MongoClient(url, {useNewUrlParser: true,replicaSet: 'rs'});
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
// require('./models/boxTransaction');
// require('./models/toPay');
// require('./models/box');
// require('./models/avatar');

const League = mongoose.model('league');
const scoreboardSchema = require('./db/models/scoreboard');

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
        f();
    });

}).catch((err) => {
    debug(err);
});

/*
User.find({_id:'5c4b57c8eca18e404443adab'}).then(res=>{
    debug(res);
})
*/

// var user = new User(
//     {
//         username: 'pooriyaaa',
//         phoneNumber: 9139336452
//     }
// );
// /*user .save((err,user)=>{
//     if(!err)
//         debug.log(user);
// });*/
//
// var game = new Game(
//     {name: 'Tower', description: 'خیلی خفنه!'}
// );
// /*game.save((err, game) => {
//     if (!err) debug.log(game);
// });*/
//
//
//
// var league = new League(
//     {
//         name :'Diamond' , description: 'شرح لیگ' , game :'5c4b4eb7fc17d80a800bfbb7'
//     }
// );
/*league.save((err, league) => {
    if (!err) debug.log(league);
});*/
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
/* let rcs =[];
Scoreboard.find((err,results)=>{
    debug.log(results);
});*/

