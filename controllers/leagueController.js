const _ = require('underscore');
const path = require('path');
const mongoose = require('mongoose');
const rimraf = require('rimraf');
const AdmZip = require('adm-zip');
const urljoin = require('url-join');
const League = mongoose.model('league');
const schedule = require('node-schedule');
const {giveRewards} = require('../utils/dbFunctions');
const Job = mongoose.model('job');
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

 async function createLeague (req,res) {
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
        const job = new Job({
            property: league.collectionName,
            type:'reward',
            fireTime: league.endTime,
            processOwner:process.env.NODE_APP_INSTANCE != null ? process.env.NODE_APP_INSTANCE : null });
        job.save((err,job)=> {
            if(job) {
                schedule.scheduleJob(league.collectionName,league.endTime, async function(fireTime){
                    const jobInFireTime = await Job.findOne({property:this.name, type: 'reward'});
                        if(jobInFireTime && Math.abs(new Date(jobInFireTime.fireTime).getTime() - fireTime.getTime()) < 1000 && (!jobInFireTime.processOwner || jobInFireTime.processOwner == process.env.NODE_APP_INSTANCE )) {
                            giveRewards(league.collectionName).then(()=> {
                                debug('rewarded');
                                Job.deleteOne({property:league.collectionName, type:'reward'}).exec();
                            }).catch(()=> {
                                debug('error in rewarding');
                            });
                        }    
                });
            }
            return res.status(200).send(league);
        });
        
    });
}

async function updateLeague (req,res) {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;

    const info = _.pick(req.body, 'name', 'collectionName', 'description', 'startTime', 'endTime', 'available',
        'defaultOpportunities', 'maxOpportunities','html','color','leadersNumber',
        'loyaltyGivens','coinsReward', 'loyaltiesReward');
        if(info.defaultOpportunities)
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

    const league = await League.findById(req.params._id).lean();
    let shouldSchedule = true;
    if(league && info.endTime) {
        const oldEndTime = new Date(league.endTime).getTime();
        const newEndTime = new Date(info.endTime);
        if(oldEndTime === newEndTime || league.rewarded === true)
            shouldSchedule = false;
    }
    League.findOneAndUpdate({_id: req.params.id}, info, {new: true}, (err, league) => {
        if (err) {
            console.log(err);
            return res.status(400).send();
        }
        else if (!league)
            return res.sendStatus(404);
        
        if(shouldSchedule) { 
            const job = {
                fireTime: league.endTime,
                processOwner:process.env.NODE_APP_INSTANCE != null ? process.env.NODE_APP_INSTANCE : null };
                Job.findOneAndUpdate(
                {property:league.collectionName, type:'reward'},job,(err,dbJob)=> {
                    if(err) console.log(err);
                    if(dbJob && !err) {
                        if(!dbJob.processOwner || dbJob.processOwner === process.env.NODE_APP_INSTANCE) {
                            schedule.rescheduleJob(league.collectionName,league.endTime);
                        }
                        else{
                            schedule.scheduleJob(league.collectionName,league.endTime, async function(fireTime){
                                const jobInFireTime = await Job.findOne({property:this.name, type: 'reward'});
                                    if(jobInFireTime && Math.abs(new Date(jobInFireTime.fireTime).getTime() - fireTime.getTime()) < 1000 && (!jobInFireTime.processOwner || jobInFireTime.processOwner == process.env.NODE_APP_INSTANCE )) {
                                        giveRewards(league.collectionName).then(newLeague=> {
                                            debug('rewarded');
                                            Job.deleteOne({property:league.collectionName, type:'reward'}).exec();
                                        }).catch(err=> {
                                            debug('error in rewarding');
                                        });
                                    }    
                            });
                        } 
                    }
                                           
                });
            }
        return res.status(200).send(league);
    });
                
            
       

}

async function deleteLeague (req,res) {
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
            Job.deleteOne({property:league.collectionName, type:'reward'},(err,res)=> {
                if(err)
                console.log(err);
            });
            return res.status(200).send({data:league});
        }
        else return res.sendStatus(404);
    });

}


module.exports = {
    getLeague, getLeagues, createLeague, updateLeague, deleteLeague
};