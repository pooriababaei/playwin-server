const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const League = mongoose.model('league');
const user_key = fs.readFileSync(path.join(__dirname, '../keys/user_key')).toString();
const admin_key = fs.readFileSync(path.join(__dirname, '../keys/admin_key')).toString();
const app_key = fs.readFileSync(path.join(__dirname, '../keys/app_key')).toString();
const debug = require('debug')('Middleware:');


const isUser = function (req, res, next) {
    const token = req.headers.token;
    if (token) {
        jwt.verify(token, user_key, function (err, decoded) {
            if (err)
                return res.send(401).send();
            if (decoded && decoded.role === 'user') {
                req.userId = decoded._id;
                req.username = decoded.username;
                req.phoneNumber = decoded.phoneNumber;
                req.avatar=decoded.avatar;
                next();
            }
            else
                return res.status(401).send();
        });
    }
    else {
        return res.status(401).send();
    }
};

const isAdmin = function (req, res, next) {
    const token = req.headers.token;
    if (token) {
        jwt.verify(token, admin_key, function (err, decoded) {
            if (err)
                return res.send(401).send();
            if (decoded && decoded.role === 'admin') {
                req.adminId = decoded._id;
                req.email = decoded.email;
                next();
            }
            else
                return res.status(401).send();
        });
    }
    else {
        return res.status(401).send();
    }
};

const isUserOrAdmin = function (req, res, next) {
    const token = req.headers.token;
    if (token) {
        jwt.verify(token, user_key, function (err, decoded) {
            if (decoded && decoded.role === 'user') {
                req.userId = decoded._id;
                req.phoneNumber = decoded.phoneNumber;
                next();
            }
            else {
                jwt.verify(token, admin_key, function (err, decoded) {
                    if (decoded && decoded.role === 'admin') {
                        req.adminId = decoded._id;
                        req.email = decoded.email;
                        next();
                    }

                    else return res.sendStatus(401);

                });
            }
        });
    }
};

const isApp = function (req, res, next) {
    const token = req.headers.token;
    if (token) {
        jwt.verify(token, app_key, function (err, decoded) {
            if (err)
                return res.send(401).send();
            if (decoded && decoded.app == true)
                next();
            else
                return res.status(401).send();
        });
    }
    else
        return res.status(401).send();

};

const isLeagueUp = function (req, res, next) {
    let league;
    if (req.params.leagueSpec)
        league = req.params.leagueSpec;
    else if (req.body.leagueSpec)
        league = req.body.leagueSpec;
    else if (req.query.leagueSpec)
        league = req.query.leagueSpec;

    if (mongoose.modelNames().indexOf(league) > -1) {
       // debug(mongoose.modelSchemas)
        League.findOne({spec: league}, (err, league) => {
            if (err)
                return res.sendStatus(500);
            else if (!league)
                return res.sendStatus(404);
            else if (league && (league.available == false || league.end_date <= Date.now() || league.start_date >= Date.now())) // league is not up
                return res.sendStatus(404);

            else {
                req.league = league;
                next();
            }
        });
    }
    else {
        return res.sendStatus(404);

    }

};

/*const isLeagueUp = function (req, res, next) {
    let league;
    if (req.params.leagueSpec)
        league = req.params.leagueSpec;
    else if (req.body.leagueSpec)
        league = req.body.leagueSpec;
    else if (req.query.leagueSpec)
        league = req.query.leagueSpec;

    if (mongoose.modelNames().indexOf(league) > -1) {
        League.findOne({spec: league}, (err, league) => {
            if (err)
                return res.sendStatus(500);
            else if (!league)
                return res.sendStatus(404);
            else if (league && (league.available == false || league.end_date <= Date.now() || league.start_date >= Date.now())) // league is not up
                return res.sendStatus(404);

            else {
                req.league = league;
                next();
            }
        });
    }
    else {
        debug('hey');
        return res.sendStatus(404);

    }

};*/

module.exports = {
    isUser,
    isAdmin,
    isUserOrAdmin,
    isApp,
    isLeagueUp
};