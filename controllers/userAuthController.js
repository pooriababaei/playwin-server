const _ = require('underscore');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Auth = mongoose.model('auth');
const cryptoRandomString = require('crypto-random-string');
const {sendSMS} = require('../utils/functions');
const debug = require('debug')('UserAuth Controller:');


function getAuthCode (req,res) {
    const info = {
        phoneNumber: req.params.phone
    };

    let auth = new Auth(info);
    if ((info.phoneNumber.length === 10 || info.phoneNumber.length === 11) && info.phoneNumber.match("0{0,1}9[0-9]{9}$")) {
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
}

function auth (req,res){
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

}

function checkUniqueUsername (req,res) {
    const username = req.params.username;
    User.findOne({username: username}, (err, user) => {
        if (err) return res.sendStatus(500);
        else if (user) return res.sendStatus(400);
        else if (!user) return res.sendStatus(200);
    });
}

async function signup (req,res) {
    const info = _.pick(req.body, 'username', 'phoneNumber', 'avatar');
    if(!req.body.username) {
        let username = null;
        let user = null;
        do {
            username = cryptoRandomString({length: 7, type: 'base64'});
            user = await User.findOne({username: username});
            info.username = username;
        }
        while (user);
    }
    const userInfo = new User(info);
    userInfo.save((err, user) => {
        debug(err);
        if (err)
            return res.status(400).send(err);
        else if (user) {
            if (req.body.invitedBy && req.body.invitedBy !== info.username && req.body.invitedBy.length > 0) {
                User.findOneAndUpdate({username: req.body.invitedBy}, {
                    $inc: {opportunities: 20},
                    $push: {invitingUsers: user._id}
                }, {new: true}, function (err, invitingUser) {
                    if (err) debug(err);
                });
            }
            return res.status(200).json({token: user.generateToken()});
        }
    });
}


module.exports ={
    getAuthCode, auth, checkUniqueUsername, signup
};