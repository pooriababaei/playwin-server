const _ = require('underscore');
const path = require('path');
const mongoose = require('mongoose');
const rimraf = require('rimraf');
const League = mongoose.model('league');
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
            leagueState.end_time = {$gte: Date.now()};
            leagueState.start_time = {$lte: Date.now()};
        }
        else if (filter.running === 2) {  //future leagues
            leagueState.start_time = {$gt: Date.now()};
        }
        else if (filter.running === 3) {  //past leagues
            leagueState.end_time = {$lt: Date.now()};
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
           if(league.start_time < Date.now()) {
               const Scoreboard = mongoose.model(league.spec);
               league.playerCount = await Scoreboard.find().countDocuments;
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

    const info = _.pick(req.body, 'name', 'spec', 'description', 'start_time', 'kind', 'end_time', 'available',
        'default_opportunities', 'max_opportunities','html','baseColor','secondaryColor','leadersNumber',
        'loyaltyGivensNumber','rewardCoinNumber');
    info.default_opportunities = info.default_opportunities - 1;

    if (req.files && req.files.mainImage) {
        mainImage = '/public/leagues/' + req.body.spec + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;

    }

    if (req.files && req.files.gif) {
        gif = '/public/leagues/' + req.body.spec + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        // extract_zip(path.join(__dirname, '../public/leagues/', req.body.name, req.files.game[0].originalname),
        //     {dir: path.join(__dirname, '../public/leagues/', req.body.name)}, (err) => {
        //         if (err)
        //             debug(err);
        //     });
        var zip = new AdmZip(path.join(__dirname, '../public/leagues/', req.body.spec, req.files.game[0].originalname));
        zip.extractAllTo(path.join(__dirname, '../public/leagues/', req.body.spec), /*overwrite*/true);

        game = urljoin('/public/leagues', req.body.spec , req.files.game[0].originalname.split('.')[0] , info.html);
        gameZip = urljoin('/public/leagues', req.body.spec , req.files.game[0].originalname);

        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/leagues/' + req.body.spec + '/images/' + req.files.images[i].filename;
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
        mongoose.model(league.spec, scoreboardSchema(league.default_opportunities, league.spec));
        return res.status(200).send(league);
    });
}

function updateLeague (req,res) {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;

    const info = _.pick(req.body, 'name', 'spec', 'description', 'start_time', 'end_time', 'available',
        'default_opportunities', 'max_opportunities','html','baseColor','secondaryColor','leadersNumber',
        'loyaltyGivensNumber','rewardCoinNumber');
    info.default_opportunities = info.default_opportunities - 1;

    if (req.files && req.files.mainImage) {
        mainImage = '/public/leagues/' + req.body.spec + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;
    }

    if (req.files && req.files.gif) {
        gif = '/public/leagues/' + req.body.spec + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        extract_zip(path.join(__dirname, '../public/leagues/', req.body.spec, req.files.game[0].originalname),
            {dir: path.join(__dirname, '../public/leagues/', req.body.spec)}, (err) => {
                if (err)
                    debug(err);
            });

        game = urljoin('/public/leagues', req.body.spec , req.files.game[0].originalname.split('.')[0] , info.html);
        gameZip = urljoin('/public/leagues', req.body.spec , req.files.game[0].originalname);

        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/leagues/' + req.body.spec + '/images/' + req.files.images[i].filename;
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
            mongoose.connection.collections[league.spec].drop(function(err) {
                if(!err) delete mongoose.connection.models[league.spec];
            });
            rimraf.sync(path.join(__dirname, '../public/leagues', league.spec));
            return res.status(200).send({data:league});
        }
        else return res.sendStatus(404);
    });

}


module.exports = {
    getLeague, getLeagues, createLeague, updateLeague, deleteLeague
};