let express = require('express');
const async = require('async');
const _ = require('underscore');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const merchantId = fs.readFileSync(path.join(__dirname, '../keys/merchant_key')).toString();
const ZarinpalCheckout = require('zarinpal-checkout');
const zarinpal = ZarinpalCheckout.create(merchantId, false);
const User = mongoose.model('user');
const League = mongoose.model('league');
const Game = mongoose.model('game');
const Box = mongoose.model('box');
const Auth = mongoose.model('auth');
const resize= require('../dependencies/resize');
let router = express.Router();
const {isUser, isLeagueUp} = require('../dependencies/middleware');
const {sendSMS} = require('../dependencies/functions');
const {surroundingUsers, pagingUsers, userRank, surroundingUserRanks,edgeUsersRank, exchangeTotalOppoToLeagueOppo, exchangeCoinToMoney} = require('../dependencies/dbFunctions');
const debug = require('debug')('User Route:');


router.get('/checkNewVersion/:version', (req, res) => {
    if (req.params.version < newestAppVersion)                   //there is a new version
        return res.status(200).json({code: 1, path: '/public/new_app/' + APP_NAME});
    return res.status(200).json({code: 0});
});

router.get('/getAuthCode/:phone', (req, res) => {  //check inside later
    const info = {
        phoneNumber: req.params.phone
    };

    let auth = new Auth(info);
    if (info.phoneNumber.length == 10 && info.phoneNumber.match("0{0,1}9[0-9]{9}$")) {
        auth.save((err, auth) => {
            if (err)
                return res.status(400).send();

            if (auth) {
                sendSMS(info.phoneNumber,auth.authToken);//here we should send authToken to auth phone number
                return res.status(200).json(auth); //this is for test . we shouldnt send auth info here
            }
        });
    }
    else
        return res.sendStatus(400);

});

router.get('/auth/:phone/:token', (req, res) => {
    debug(req.params.phone);

    Auth.authenticate(req.params.phone, req.params.token).then((userAuth) => {
        if (userAuth) {
            User.findOne({phoneNumber: req.params.phone}, (err, user) => {
                if (err) return res.sendStatus(500);
                if (user) {     // user exists.
                    const token = user.generateToken();
                    return res.status(200).json({token: token});
                }
                else if (!user) {
                    return res.status(200).send(userAuth);
                }
            });
        }
        else
            res.sendStatus(400);
    }).catch(err => {
        res.status(500).send(err);
    })


});

router.get('/checkUniqueUsername/:username', (req, res) => {
    const username = req.params.username;
    User.findOne({username: username}, (err, user) => {
        if (err) return res.sendStatus(500);
        else if (user) return res.sendStatus(400);
        else if (!user) return res.sendStatus(200);
    });
});

router.post('/signup', (req, res) => {
    const info = _.pick(req.body, 'username', 'phoneNumber', 'avatar');
    const userInfo = new User(info);
    debug(userInfo);
    userInfo.save((err, user) => {
        debug(err);
        if (err)
            return res.status(400).send(err);
        else if (user) {
            if (req.body.invitedBy && req.body.invitedBy !== info.username && req.body.invitedBy.length > 0) {
                User.findOneAndUpdate({username: req.body.invitedBy}, {
                    $inc: {opportunities: 30},
                    $push: {invitingUsers: user._id}
                }, {new: true}, function (err, invitingUser) {
                    if (err) debug(err);
                    if (invitingUser)
                        debug(invitingUser);
                });
            }
            return res.status(200).json({token: user.generateToken()});
        }

    })


});

router.get('/', isUser,(req,res)=>{
    User.findById(req.userId,(err,user)=> {
        if(err)
            res.sendStatus(500);
        else if (user == null)
            res.sendStatus(404);
        else res.status(200).json(user);

    })
});

router.put('/', isUser, (req, res) => {
    const extraOppo = req.query.extraOppo;
    const info = _.pick(req.body, 'avatar', 'account');
    User.findOneAndUpdate({_id:req.userId},{...info,$inc:{opportunities:extraOppo == 'true'? ADVERTISE_AWARD_OPPO : 0}},{new:true},(err,user)=>{
        if(err)
            res.sendStatus(500);
        else if (!user)
            res.sendStatus(404);
        else {
            if(!info.avatar){
                return res.status(200).send(user);
            }
           else {
               if(user.participated_leagues) {
                   user.participated_leagues.forEach(leagueId =>{
                       League.findById(leagueId,(err,league)=>{
                           if(league && mongoose.modelNames().indexOf(league.spec) > -1) {
                               const Scoreboard = mongoose.model(league.spec);
                               Scoreboard.findOneAndUpdate({user:req.userId},{avatar:info.avatar},(err,record)=>{
                                   if(err) return res.sendStatus(500);
                               });
                           }
                       });
                   });
                   return res.status(200).send(user);
               }

            }
        }
    });

});

////////////////////////////////////////////////

router.get('/leagues', isUser, (req, res) => {
    let leagueState = {available: true}; //just available leagues must be shown to user.
    if (req.query.hasOwnProperty('running')) {
        if (req.query.running == 1) {  // up leagues
            leagueState.end_date = {$gte: Date.now()};
            leagueState.start_date = {$lte: Date.now()};
        }
        else if (req.query.running == 2) {  //future leagues
            leagueState.start_date = {$gt: Date.now()};
        }
        else if (req.query.running == 3) {
            leagueState.end_date = {$lt: Date.now()}  // past leagues
        }

    }
    if (req.query.hasOwnProperty('leagueId')) {
        leagueState._id = req.query.leagueId;
    }
    League.find(leagueState, (err, leagues) => {
        if (err)
            return res.sendStatus(500);
        if (!leagues)
            return res.sendStatus(404);
        let labeldleagues = leagues.map(x=>{
            return x.toObject();
        });
        labeldleagues.forEach(function (x) {
            if (Date.now() >= x.start_date && Date.now() <= x.end_date)
                x.label = 1;
            else if (Date.now() < x.start_date)
                x.label = 2;
            else if (Date.now() > x.end_date)
                x.label = 3;
        });
        return res.status(200).json(labeldleagues);
    });
});  //with req.query (running and league) both are optional

router.get('/modifyScoreboard/:leagueSpec/:type', isUser, isLeagueUp, (req, res) => {

    let Scoreboard = mongoose.model(req.league.spec);

    if (!Scoreboard) return res.sendStatus(400);

    if (req.params.hasOwnProperty('type')) {
        switch (parseInt(req.params.type)) {
            case 1 :  // reduce oppo  . this should be passed to play one game round in client
                Scoreboard.findOne({user: req.userId}, (err, result) => {
                    if (err)
                        return res.status(500).send();

                    if (!result) {
                        const record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            avatar: req.avatar,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save((err, record) => {
                            if (err)
                                return res.status(500).send(err);
                            if (record)
                                User.findOneAndUpdate({_id: req.userId}, {
                                    $push: {participated_leagues: req.league._id}
                                }, {new: true}, function (err, user) {
                                    if (err) debug(err);
                                    if (user)
                                        return res.status(200).send(record);
                                });


                        });
                    }

                    else if (result && result.opportunities > 0) {
                        if (!req.league.max_opportunities || (req.league.max_opportunities && req.league.max_opportunities > result.played)) {
                            let newRecord = result;
                            newRecord.opportunities = result.opportunities - 1;
                            newRecord.played = result.played + 1;
                            newRecord.save((err, result1) => {
                                if (err)
                                    return res.status(400).send(err);

                                else if (result1)
                                    res.status(200).send(result1);
                            });
                        }
                        else
                            return res.status(200).json({code: 3}); //reach maximum number of game plays

                    }

                    else if (result && result.opportunities <= 0)
                        return res.status(200).json({code: 1}); // no opportunity

                });
                break;
            case 2 :  // make score
                if (req.query.hasOwnProperty('score')) {
                    const score = req.query.score;
                    Scoreboard.findOne({user: req.userId}, (err, result) => {
                            if (err)
                                return res.status(500).send();

                            if (!result) {
                                return res.status(400).json({code: 1});  // not legal
                            }

                            else if (result && result.opportunities >= 0 && result.score < score) {
                                let newRecord = result;
                                newRecord.score = score;
                                newRecord.updatedAt = Date.now();
                                if (result.opportunities == 0) //it won't let user
                                    newRecord.opportunities = result.opportunities - 1;

                                newRecord.save((err, result1) => {
                                    if (err)
                                        return res.status(400).send(err);

                                    else if (result1)
                                        return res.status(200).send(result1);
                                });
                            }

                            else if (result && result.opportunities >= 0 && result.score >= score) {
                                return res.status(400).json({code: 2}); // score is less than  or equal record .it shouldn't have been sent
                            }

                            else if (result && result.opportunities < 0)  //maybe not needed because we check it in reduceOppo mode
                                return res.status(200).json({code: 1});  // not legal req

                        }
                    );
                }
                else
                    return res.sendStatus(400);
                break;

            case 3 :  // reduce and make score for leagues that opprtunity is new record NOT playing
                if (req.query.hasOwnProperty('score')) {
                    const score = req.query.score;
                    Scoreboard.findOne({user: req.userId}, (err, result) => {
                        if (err)
                            return res.sendStatus(500);

                        if (!result) {
                            const record = new Scoreboard({
                                user: req.userId,
                                username: req.username,
                                avatar: req.avatar,
                                score: score,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            });
                            record.save((err, record) => {
                                if (err)
                                    return res.status(500).send(err);
                                if (record)
                                    User.findOneAndUpdate({_id: req.userId}, {
                                        $push: {participated_leagues: req.league._id}
                                    }, {new: true}, function (err, user) {
                                        if (err) debug(err);
                                        if (user)
                                            return res.status(200).send(record);
                                    });


                            });
                        }

                        else if (result && result.opportunities > 0 && result.score < score) {
                            if (!req.league.max_opportunities || (req.league.max_opportunities && req.league.max_opportunities >= result.played)) {
                                let newRecord = result;
                                newRecord.score = score;
                                newRecord.opportunities = result.opportunities - 1;
                                newRecord.updatedAt = Date.now();
                                newRecord.played = result.played + 1;

                                newRecord.save((err, result1) => {
                                    if (err)
                                        return res.status(400).send(err);

                                    else if (result1)
                                        res.status(200).send(result1);
                                });
                            }
                            else
                                return res.status(400).json({code: 3}); //reach maximum number game plays
                        }
                        else if (result && result.opportunities > 0 && result.score >= score) {
                            return res.status(400).json({code: 2}); // score is less than  or equal record .it shouldn't have been sent
                        }

                        else if (result && result.opportunities <= 0)
                            return res.status(400).json({code: 1});  //no oppotunity

                    });
                }
                else return res.sendStatus(400);
                break;
            case 4 :
                Scoreboard.findOne({user: req.userId}, (err, result) => {
                    if (err)
                        return res.sendStatus(500);
                    if (result == null) {
                        const record = new Scoreboard({
                            user: req.userId,
                            username: req.username,
                            played:0,
                            avatar: req.avatar,
                            opportunities: (req.league.max_opportunities && req.league.max_opportunities < req.league.default_opportunities + ADVERTISE_AWARD_OPPO) ? req.league.default_opportunities : req.league.default_opportunities + ADVERTISE_AWARD_OPPO,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        });
                        record.save((err, record) => {
                            if (err)
                                return res.status(500).send(err);
                            if (record)
                                User.findOneAndUpdate({_id: req.userId}, {
                                    $push: {participated_leagues: req.league._id}
                                }, {new: true}, function (err, user) {
                                    if (err) debug(err);
                                    if (user)
                                        return res.status(200).send(record);
                                });
                        });
                    }
                    else if (!req.league.max_opportunities || result && result.opportunities + result.played + ADVERTISE_AWARD_OPPO <=req.league.max_opportunities) {
                            let newRecord = result;
                            newRecord.opportunities = result.opportunities + ADVERTISE_AWARD_OPPO;
                            newRecord.save((err, result1) => {
                                if (err)
                                    return res.status(400).send(err);

                                else if (result1)
                                    res.status(200).send(result1);
                            });

                    }
                    else return res.sendStatus(400);
                });
                break; //add oppo because for watching advertisement
        }

    }
    else
        return res.sendStatus(400);
});

router.get('/userRecord/:leagueSpec',isUser,(req,res)=>{
    let Scoreboard = mongoose.model(req.params.leagueSpec);
    if (!Scoreboard) return res.sendStatus(400);

    Scoreboard.findOne({user: req.userId}, (err, result) => {
        if (err)
            return res.status(500).send();
        else if (result)
            return res.status(200).send(result);
        else
            return res.status(404).send();

    });
});

router.get('/rank/:leagueSpec', isUser, (req, res) => {
    const league = req.params.leagueSpec;
    debug(req.userId);
    userRank(league, req.userId).then(rank => {
        if (rank)
            return res.status(200).json({rank: rank});
        else
            return res.status(404).send();
    }).catch(err => {
        return res.status(500).send(err);
    })
});

router.get('/surroundingUserRanks/:leagueSpec/:limit', isUser, (req, res) => {
    const league = req.params.leagueSpec;
    const limit = parseInt(req.params.limit);

    surroundingUserRanks(league, req.userId, limit).then(page => {
        return res.status(200).json(page);
    }).catch(err => {
        return res.status(500).send(err);
    })

});

router.get('/surroundingUsers/:leagueSpec/:limit', isUser, (req, res) => {
    const id = req.userId;
    const league = req.params.leagueSpec;
    const limit = parseInt(req.params.limit);
    debug(limit);
    surroundingUsers(league, id, limit).then(result => {
        return res.status(200).json(result)
    }).catch(err => {
        debug(err);
        return res.status(500).send();
    });

});

router.get('/edgeUsersRank/:leagueSpec',isUser,(req,res)=>{
const league = req.params.leagueSpec;
const edge1 = req.query.edge1;
const edge2 = req.query.edge2;
edgeUsersRank(league,edge1,edge2).then(result =>{
    return res.status(200).send(result);
}).catch(err =>{
    return res.status(500).send(err);
});
});

router.get('/pagingUsers/:leagueSpec/:limit/:page', isUser, (req, res) => {
    const league = req.params.leagueSpec;
    const limit = parseInt(req.params.limit);
    const page = parseInt(req.params.page);

    pagingUsers(league, limit, page).then(result => {
        return res.status(200).json(result);
    }).catch(err => {
        debug(err);
        return res.status(500).send();
    });

});

////////////////////////////////////////////////

router.get('/exchangeTotalOppoToLeagueOppo/:leagueSpec/:opportunities/', isUser, isLeagueUp, (req, res) => {
    const league = req.league;
    const oppo = req.params.opportunities;
    debug(req.userId);
    debug(req.username);
    debug(oppo);
    debug(league);

    exchangeTotalOppoToLeagueOppo(req.userId, req.username, oppo, league).then(result => {
        res.status(200).json(result);
    }).catch(err => {
        debug(err);
        if(err == 1 || err == 2)
            return res.status(400).send({code:err});
        res.status(500).send(err.toString());
    });  //if throws 1 not enough oppo. if throws 2 max_opportunities bound(client mistake). otherwise returns updated user and record


});

router.get('/exchangeCoinToMoney/:coins',isUser,(req,res)=>{
    const coins = parseInt(req.params.coins);
           try{
               if(isNaN(coins) || coins <=0) return res.sendStatus(400);
               if(coins < COIN_TRESHOLD_TO_EXCHANGE) return res.status(400).send({code: 1}); // Less than treshold for exchange. somehow is the client bug.
               exchangeCoinToMoney(req.userId,coins).then(result=>{
                   res.status(200).send(result.toString());
               }).catch(err => {
                   debug(err);
                   if(err == 2)
                       return res.status(400).send({code: err});
                   res.sendStatus(500);
               });
           }catch (e) {
               debug(e)
               return res.sendStatus(400);
           }



});

////////////////////////////////////////////////

router.get('/boxes', isUser, (req, res) => {
    Box.find((err, result) => {
        if (err) return res.sendStatus(500);
        return res.status(200).send(result);
    })
});

router.get('/boxPurchase/:boxId',isUser,(req,res)=> {
    Box.findById(req.params.boxId,(err,box)=>{
        if(err) return res.sendStatus(500);
        if(!box) return res.sendStatus(400);
        else {
            let price = box.offPrice ? box.offPrice : box.price;
            zarinpal.PaymentRequest({
                Amount: price, // In Tomans
                CallbackURL: PLAYWIN_API_URL + '/user/validatePurchase',
                Description: 'خرید کوپن فرصت',
                Mobile: req.phoneNumber
            }).then(response => {
                if (response.status === 100)  return res.status(200).send({goTo:`https://www.zarinpal.com/pg/StartPay/${response.url}/MobileGate`});
                else return res.sendStatus(500);

            }).catch(err => {
                return res.sendStatus(500);
            });
        }
    })
});

router.get('/validatePurchase',(req,res)=> {
    const authority = req.query.authority;
    const status = req.query.status;
    if(status ==='OK') {
        zarinpal.PaymentVerification({
            Amount: '1000', // In Tomans
            Authority: '000000000000000000000000000000000000',
        }).then(response => {
            if (response.status === -21) {
                console.log('Empty!');
            } else {
                console.log(`Verified! Ref ID: ${response.RefID}`);
            }
        }).catch(err => {
            console.error(err);
        });
    }

});

////////////////////////////////////////////////

router.get('/games', isUser, (req, res) => {
    let gameState = {available: true};
    Game.find(gameState, (err, games) => {
        if (err)
            return res.sendStatus(500);
        if (!games)
            return res.sendStatus(404);
        return res.status(200).json(games);
    });
});

////////////////////////////////////////////////

router.get('/resizedImage',isUser,(req,res)=>{
    const image = req.query.imagePath;
    const widthString = req.query.width;
    const heightString = req.query.height;
    const format = req.query.format;

    // Parse to integer if possible
    let width, height;
    if (widthString) {
        width = parseInt(widthString)
    }
    if (heightString) {
        height = parseInt(heightString)
    }
    // Set the content-type of the response
    res.type(`image/${format || 'png'}`);

    // Get the resized image
    resize(path.join(__dirname,'../',image), format, width, height).pipe(res)
});


module.exports = router;
