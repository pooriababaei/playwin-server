const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
var CryptoJS = require("crypto-js");
const mongoose = require('mongoose');
const League = mongoose.model('league');
const user_key = fs.readFileSync(path.join(__dirname, '../keys/user_key')).toString();
const admin_key = fs.readFileSync(path.join(__dirname, '../keys/admin_key')).toString();
const app_key = fs.readFileSync(path.join(__dirname, '../keys/app_key')).toString();
const debug = require('debug')('Middleware:');


const isUser = function (req, res, next) {
    if(req.headers.authorization == null)
        return res.sendStatus(401);
    const authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2)
        return res.sendStatus(401);
    const bearer = authArray[0];
    const token = authArray[1];


    if (bearer === "Bearer" && token) {
        jwt.verify(token, user_key, function (err, decoded) {
            if (err)
                return res.sendStatus(401);
            if (decoded && decoded.role && decoded.role === 'user') {
                req.userId = decoded._id;
                req.username = decoded.username;
                req.phoneNumber = decoded.phoneNumber;
                next();
            }
            else
                return res.sendStatus(401);
        });
    }
    else {
        return res.sendStatus(401);
    }
};

const isAdmin = function (req, res, next) {
    if(req.headers.authorization == null)
        return res.sendStatus(401);
    const authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2)
        return res.sendStatus(401);
    const bearer = authArray[0];
    const token = authArray[1];

    if (bearer === "Bearer" && token) {
        jwt.verify(token, admin_key, function (err, decoded) {
            if (err)
                return res.send(401).send();
            if (decoded && decoded.role && (decoded.role === 'admin' || decoded.role === 'superadmin')) {
                req.adminId = decoded._id;
                req.email = decoded.email;
                req.username = decoded.username;
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

const isSuperAdmin = function (req, res, next) {
    if(req.headers.authorization == null)
        return res.sendStatus(401);
    const authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2)
        return res.sendStatus(401);
    const bearer = authArray[0];
    const token = authArray[1];

    if (bearer === "Bearer" && token) {
        jwt.verify(token, admin_key, function (err, decoded) {
            if (err)
                return res.send(401).send();
            if (decoded && decoded.role && decoded.role === 'superadmin') {
                req.adminId = decoded._id;
                req.email = decoded.email;
                req.username = decoded.username;
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
    if(req.headers.authorization == null)
        return res.sendStatus(401);

    const authArray = req.headers.authorization.toString().split(" ");
    if (authArray.length !== 2)
        return res.sendStatus(401);
    const bearer = authArray[0];
    const token = authArray[1];


    if (bearer === "Bearer" && token) {
        jwt.verify(token, user_key, function (err, decoded) {
            if (decoded && decoded.role && decoded.role === 'user') {
                req.userId = decoded._id;
                req.phoneNumber = decoded.phoneNumber;
                next();
            }
            else {
                jwt.verify(token, admin_key, function (err, decoded) {
                    if (decoded && decoded.role && (decoded.role === 'admin' || decoded.role === 'superadmin')) {
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
    try{
    if(req.headers['content-size'] == null)
        return res.sendStatus(401);
    let phone = null; 
    if(req.phoneNumber)
        phone = req.phoneNumber;
    else if (req.params.phone)
        phone = req.params.phone;
    else return res.sendStatus(401);
    const bytes  = CryptoJS.AES.decrypt(req.headers['content-size'], app_key + phone);
    if(bytes.toString() !== "") {
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        if(decryptedData.score)
            req.score = decryptedData.score;
        next();
    }
    else
        return res.sendStatus(401);
    }catch(err) {
        return res.sendStatus(401);
    }
};

const isLeagueUp = function (req, res, next) {
    let league;

    if (req.params.collectionName)
        league = req.params.collectionName;
    else if (req.body.collectionName)
        league = req.body.collectionName;
    else if (req.query.collectionName)
        league = req.query.collectionName;

    if (mongoose.modelNames().indexOf(league) > -1) {
        League.findOne({collectionName: league}, (err, league) => {
            if (err)
                return res.sendStatus(500);
            else if (!league)
                return res.sendStatus(404);
            else if (league && (league.available === false || league.endTime < Date.now() || league.startTime > Date.now())) // league is not up
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

module.exports = {
    isUser,
    isAdmin,
    isSuperAdmin,
    isUserOrAdmin,
    isApp,
    isLeagueUp
};