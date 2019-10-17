const _ = require('underscore');
const path = require('path');
const mongoose = require('mongoose');
const rimraf = require('rimraf');
const AdmZip = require('adm-zip');
const urljoin = require('url-join');
const League = mongoose.model('league');
const scoreboardSchema = require('../db/models/scoreboard');
const debug = require('debug')('League Controller:');



async function getLeagues (req,res) {
    let leagueState = {};

    let sort = null;
    let filter = null;

    if (req.query.sort)
        sort = JSON.parse(req.query.sort);
    if (req.query.filter)
        filter = JSON.parse(req.query.filter);

    if (filter && filter.running) {
        if (filter.running === 1) {  // up leagues
            leagueState.endTime = {$gte: Date.now()};
            leagueState.startTime = {$lte: Date.now()};
        }
        else if (filter.running === 2) {  //future leagues
            leagueState.startTime = {$gt: Date.now()};
        }
        else if (filter.running === 3) {  //past leagues
            leagueState.endTime = {$lt: Date.now()};
        }
    }

    if (filter && filter.available != null)
        leagueState.available = filter.available;
    if (filter && filter.kind)
        leagueState.kind = filter.kind;

    let query = League.find(leagueState);
    if (sort)
        query.sort([sort]);
   const leagues = await query.lean();
        if (!leagues)
            return res.sendStatus(404);
        for(const league of leagues) {
           if(league.startTime < Date.now() && mongoose.modelNames().includes(league.collectionName)) {
               const Scoreboard = mongoose.model(league.collectionName);
               league.playersNumber = await Scoreboard.find().countDocuments();
               const leadersPlayedTimes = await Scoreboard.find({}, 'played')
                   .limit(league.leadersNumber)
                   .skip(0)
                   .sort({score: -1, updatedAt: 1})
                   .lean();
               let sum = 0;
               for (const record of leadersPlayedTimes)
                   sum +=  record.played;
               league.leadersAveragePlayedTimes = sum / league.leadersNumber;
           }
        }

        return res.set({
            'Access-Control-Expose-Headers': 'x-total-count',
            'x-total-count': leagues.length
        }).status(200).json(leagues);

}

function getLeague (req,res) {
    League.findById(req.params.id, (err, league) => {
        if (err)
            return res.sendStatus(500);
        if (!league)
            return res.sendStatus(404);
        return res.status(200).json(league);
    });

}

function createLeague (req,res) {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;

    const info = _.pick(req.body, 'name', 'collectionName', 'description', 'startTime', 'kind', 'endTime', 'available',
        'defaultOpportunities', 'maxOpportunities','html','color','leadersNumber',
        'loyaltyGivens','coinsReward', 'loyaltiesReward');
    info.defaultOpportunities = info.defaultOpportunities - 1;

    if (req.files && req.files.mainImage) {
        mainImage = '/public/leagues/' + req.body.collectionName + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;

    }

    if (req.files && req.files.gif) {
        gif = '/public/leagues/' + req.body.collectionName + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        let zip = new AdmZip(path.join(__dirname, '../public/leagues/', req.body.collectionName, req.files.game[0].originalname));
        zip.extractAllTo(path.join(__dirname, '../public/leagues/', req.body.collectionName), /*overwrite*/true);

        const index = info.html ? info.html : 'index.html';

        game = urljoin('/public/leagues', req.body.collectionName , req.files.game[0].originalname.split('.')[0] , index);
        gameZip = urljoin('/public/leagues', req.body.collectionName , req.files.game[0].originalname);

        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/leagues/' + req.body.collectionName + '/images/' + req.files.images[i].filename;
            images.push(temp);
        }
        info.images = images;
    }

    const league = new League(info);
    league.save((err, league) => {
        if (err) {
            debug(err);
            return res.status(400).send();
        }
        mongoose.model(league.collectionName, scoreboardSchema(league.defaultOpportunities, league.collectionName));
        if(league.rewarded == false) {
            var j = schedule.scheduleJob(league.endTime, async function(){
                const newLeague = await giveRewards(league.collectionName);
                debug(newLeague.rewarded);
            });
        }
        return res.status(200).send(league);
    });
}

function updateLeague (req,res) {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;

    const info = _.pick(req.body, 'name', 'collectionName', 'description', 'startTime', 'endTime', 'available',
        'defaultOpportunities', 'maxOpportunities','html','color','leadersNumber',
        'loyaltyGivens','coinsReward', 'loyaltiesReward');
    info.defaultOpportunities = info.defaultOpportunities - 1;

    if (req.files && req.files.mainImage) {
        mainImage = '/public/leagues/' + req.body.collectionName + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;
    }

    if (req.files && req.files.gif) {
        gif = '/public/leagues/' + req.body.collectionName + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        extract_zip(path.join(__dirname, '../public/leagues/', req.body.collectionName, req.files.game[0].originalname),
            {dir: path.join(__dirname, '../public/leagues/', req.body.collectionName)}, (err) => {
                if (err)
                    debug(err);
            });

        const index = info.html ? info.html : 'index.html';

        game = urljoin('/public/leagues', req.body.collectionName , req.files.game[0].originalname.split('.')[0] , index);
        gameZip = urljoin('/public/leagues', req.body.collectionName , req.files.game[0].originalname);
        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/leagues/' + req.body.collectionName + '/images/' + req.files.images[i].filename;
            images.push(temp);
        }
        info.images = images;
    }


    League.findOneAndUpdate({_id: req.params.id}, info, {new: true}, (err, league) => {
        if (err) {
            debug(err);
            return res.status(400).send();
        }
        else if (!league)
            return res.sendStatus(404);
        
        if(info.endTime) {}
        return res.status(200).send(league);
    })
}

function deleteLeague (req,res) {
    League.findOneAndRemove({_id: req.params.id},{new:true}).lean().exec((err, league) => {
        if (err) {
            debug(err);
            return res.status(500).send(err);
        }
        else if (league) {
            mongoose.connection.collections[league.collectionName].drop(function(err) {
                if(!err) delete mongoose.connection.models[league.collectionName];
            });
            rimraf.sync(path.join(__dirname, '../public/leagues', league.collectionName));
            return res.status(200).send({data:league});
        }
        else return res.sendStatus(404);
    });

}


module.exports = {
    getLeague, getLeagues, createLeague, updateLeague, deleteLeague
};