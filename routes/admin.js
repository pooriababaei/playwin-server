const express = require('express');
const router = express.Router();
const rimraf = require('rimraf');
const extract_zip = require('extract-zip');
const path = require('path');
const {gameUpload, leagueUpload, boxUpload} = require('../dependencies/fileUpload');
const {replaceIdWith_IdInArray, replaceIdWith_Id} = require('../dependencies/functions');
const {giveAwards} = require('../dependencies/dbFunctions');

const mongoose = require('mongoose');
const _ = require('underscore');
const urljoin = require('url-join');
var AdmZip = require('adm-zip');


const Game = mongoose.model('game');
const League = mongoose.model('league');
const User = mongoose.model('user');
const Box = mongoose.model('box');
const scoreboardSchema = require('../dependencies/models/scoreboard');
const isAdmin = require('../dependencies/middleware').isAdmin;
const debug = require('debug')('Admin:');


router.put('/user/:id', (req, res) => {  //isAdmin
    const info = _.pick(req.body, 'coins', 'opportunities', 'account', 'loyalty');
    debug(info);
    User.findOneAndUpdate({_id: req.params.id}, info,{new :true}, (err, user) => {
        if (err)
            return res.status(400).send(err);
        res.status(200).send(user);
    });
});
router.delete('/user', (req, res) => {
    User.findOneAndRemove({_id: req.params.userId}, (err, user) => {
        if (err)
            return res.status(500).send(err);
        res.status(200).send('User deleted.')
    })
});
router.get('/user', (req, res) => {
    let userState = {};

    let sort = null;
    let filter = null;

    if (req.query.sort)
        sort = JSON.parse(req.query.sort);
    if (req.query.filter)
        filter = JSON.parse(req.query.filter);


    debug(req.query);
    let query = User.find();
    if (filter.username) query.find({username: { $regex: '.*' + filter.username + '.*' } });
    if (filter.phoneNumber) query.find({phoneNumber: { $regex: '.*' + filter.phoneNumber + '.*' }});

    if (sort)
        query.sort([sort]);
    query.skip((req.query.page - 1) * req.query.perPage).limit(parseInt(req.query.perPage)).exec((err, users) => {
        if (err) {
            debug(err);
            return res.sendStatus(500);
        }

        if (!users)
            return res.sendStatus(404);
        return res.set({
            'Access-Control-Expose-Headers': 'x-total-count',
            'x-total-count': users.length
        }).status(200).json(replaceIdWith_IdInArray(users));
    });
});
router.get('/user/:_id', (req, res) => {

    User.findById(req.params._id, (err, user) => {
        if (err)
            return res.sendStatus(500);
        if (!user)
            return res.sendStatus(404);
        return res.status(200).json(replaceIdWith_Id(user));
    });
});



router.post('/game', gameUpload, (req, res) => {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;
    const info = _.pick(req.body, 'name', 'description','html');

    if (req.files && req.files.mainImage) {
        mainImage = '/public/games/' + req.body.name + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;
    }

    if (req.files && req.files.gif) {
        gif = '/public/games/' + req.body.name + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        extract_zip(path.join(__dirname, '../public/games/', req.body.name, req.files.game[0].originalname),
            {dir: path.join(__dirname, '../public/games/', req.body.name)}, (err) => {
                if (err)
                    debug(err);
            });

        game = urljoin('/public/games', req.body.name , req.files.game[0].originalname.split('.')[0] , info.html);
        gameZip = urljoin('/public/games', req.body.name , req.files.game[0].originalname);

        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/games/' + req.body.name + '/images/' + req.files.images[i].filename;
            images.push(temp);
        }
        info.images = images;
    }

    const gameToSave = new Game(info);
    gameToSave.save((err, game) => {
        if (err) {
            debug(err);
            return res.status(400).send();
        }
        return res.status(200).send(game);
    });
});  //isAdmin
router.put('/game', gameUpload, (req, res) => {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;

    const info = _.pick(req.body, 'name', 'description','html');

    if (req.files && req.files.mainImage) {
        mainImage = '/public/games/' + req.body.name + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;
    }

    if (req.files && req.files.gif) {
        gif = '/public/games/' + req.body.name + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        extract_zip(path.join(__dirname, '../public/games/', req.body.name, req.files.game[0].originalname),
            {dir: path.join(__dirname, '../public/games/', req.body.name)}, (err) => {
                if (err)
                    debug(err);
            });

        game = urljoin('/public/games', req.body.name , req.files.game[0].originalname.split('.')[0] , info.html);
        gameZip = urljoin('/public/games', req.body.name , req.files.game[0].originalname);

        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/games/' + req.body.name + '/images/' + req.files.images[i].filename;
            images.push(temp);
        }
        info.images = images;
    }


    Game.findOneAndUpdate({_id: req.body.id}, info, {new: true}, (err, game) => {
        if (err) {
            debug(err);
            return res.status(400).send();
        }
        else if (!game)
            return res.sendStatus(404);
        return res.status(200).send(game);
    })
});
router.delete('/game', (req, res) => {
    Game.findOneAndRemove({_id: req.body.id}, (err, game) => {
        debug(req.body.id);
        if (err) {
            debug(err);
            return res.status(500).send(err);
        }
        else if (game) {
            rimraf.sync(path.join(__dirname, '../public/games', game.name));
            return res.sendStatus(200);
        }
        else return res.sendStatus(404);
    });
});
router.get('/games', (req, res) => {
    let gameState = {available: true};
    Game.find(gameState, (err, games) => {
        if (err)
            return res.sendStatus(500);
        if (!games)
            return res.sendStatus(404);
        return res.status(200).json(games);
    });
});

router.post('/league', leagueUpload, (req, res) => {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;

    const info = _.pick(req.body, 'name', 'spec', 'description', 'start_date', 'kind', 'end_date', 'available',
        'default_opportunities', 'max_opportunities','html','baseColor','secondaryColor','leadersNumber',
         'loyaltyGivensNumber','awardCoinsNumber');
    info.default_opportunities = info.default_opportunities - 1;

console.log(req.files);
    if (req.files && req.files.mainImage) {
        mainImage = '/public/leagues/' + req.body.name + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;

    }

    if (req.files && req.files.gif) {
        gif = '/public/leagues/' + req.body.name + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        // extract_zip(path.join(__dirname, '../public/leagues/', req.body.name, req.files.game[0].originalname),
        //     {dir: path.join(__dirname, '../public/leagues/', req.body.name)}, (err) => {
        //         if (err)
        //             debug(err);
        //     });
        var zip = new AdmZip(path.join(__dirname, '../public/leagues/', req.body.name, req.files.game[0].originalname));
        zip.extractAllTo(path.join(__dirname, '../public/leagues/', req.body.name), /*overwrite*/true);

        game = urljoin('/public/leagues', req.body.name , req.files.game[0].originalname.split('.')[0] , info.html);
        gameZip = urljoin('/public/leagues', req.body.name , req.files.game[0].originalname);

        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/leagues/' + req.body.name + '/images/' + req.files.images[i].filename;
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
});
router.put('/league/:id', leagueUpload, (req, res) => {
    let images = [];
    let mainImage;
    let gif;
    let game;
    let gameZip;

    const info = _.pick(req.body, 'name', 'spec', 'description', 'start_date', 'end_date', 'available',
        'default_opportunities', 'max_opportunities','html','baseColor','secondaryColor','leadersNumber',
        'loyaltyGivensNumber','awardCoinsNumber');
   info.default_opportunities = info.default_opportunities - 1;

    if (req.files && req.files.mainImage) {
        mainImage = '/public/leagues/' + req.body.name + '/' + req.files.mainImage[0].filename;
        info.mainImage = mainImage;
    }

    if (req.files && req.files.gif) {
        gif = '/public/leagues/' + req.body.name + '/' + req.files.gif[0].filename;
        info.gif = gif;
    }

    if (req.files && req.files.game) {
        extract_zip(path.join(__dirname, '../public/leagues/', req.body.name, req.files.game[0].originalname),
            {dir: path.join(__dirname, '../public/leagues/', req.body.name)}, (err) => {
                if (err)
                    debug(err);
            });

        game = urljoin('/public/leagues', req.body.name , req.files.game[0].originalname.split('.')[0] , info.html);
        gameZip = urljoin('/public/leagues', req.body.name , req.files.game[0].originalname);

        info.game = game;
        info.gameZip = gameZip;
    }

    if (req.files && req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
            let temp = '/public/leagues/' + req.body.name + '/images/' + req.files.images[i].filename;
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
});
router.delete('/league/:id', (req, res) => {
    League.findOneAndRemove({_id: req.params.id},{new:true}, (err, league) => {
        debug(req.body.id);
        if (err) {
            debug(err);
            return res.status(500).send(err);
        }
        else if (league) {
             mongoose.connection.collections[league.spec].drop(function(err) {
             debug('collection dropped');
             });
            rimraf.sync(path.join(__dirname, '../public/leagues', league.name));
            return res.status(200).send({data:league});
        }
        else return res.sendStatus(404);
    });
});
router.get('/league', (req, res) => {
    let leagueState = {};

    let sort = null;
    let filter = null;

    if (req.query.sort)
        sort = JSON.parse(req.query.sort);
    if (req.query.filter)
        filter = JSON.parse(req.query.filter);

    if (filter && filter.running) {
        if (filter.running == 1) {  // up leagues
            leagueState.end_date = {$gte: Date.now()};
            leagueState.start_date = {$lte: Date.now()};
        }
        else if (filter.running == 2) {  //future leagues
            leagueState.start_date = {$gt: Date.now()};
        }
        else if (filter.running == 3) {  //past leagues
            leagueState.end_date = {$lt: Date.now()};
        }
    }

    if (filter && filter.available != null)
        leagueState.available = filter.available;
    if (filter && filter.kind)
        leagueState.kind = filter.kind;


    debug(leagueState);
    let query = League.find(leagueState);
    if (sort)
        query.sort([sort]);
    query.exec((err, leagues) => {
        if (err) {
            debug(err);
            return res.sendStatus(500);
        }

        if (!leagues)
            return res.sendStatus(404);
        return res.set({
            'Access-Control-Expose-Headers': 'x-total-count',
            'x-total-count': leagues.length
        }).status(200).json(replaceIdWith_IdInArray(leagues));
    });
});  //with req.query (running and league) both are optional
router.get('/league/:id', (req, res) => {

    League.findById(req.params.id, (err, league) => {
        if (err)
            return res.sendStatus(500);
        if (!league)
            return res.sendStatus(404);
        return res.status(200).json(replaceIdWith_Id(league));
    });
});

router.post('/box', boxUpload, (req, res) => {
    const info = _.pick(req.body, 'name', 'price', 'offPrice');
    if (req.file)
        info.image = 'public/boxes/' + req.file.filename;
    const box = new Box(info);
    box.save((err, box) => {
        if (err) return res.sendStatus(500);
        if (box) return res.status(200).send(box);
        return res.sendStatus(400);
    });
});
router.put('/box/:id', boxUpload, (req, res) => {
    const info = _.pick(req.body, 'name', 'price', 'offPrice');
    if (req.files && req.files.image)
        info.image = '/public/boxes/' + req.files.image[0].filename;
    Box.findOneAndUpdate({_id: req.params.id}, info, {new: true}, (err, box) => {
        if (err) return res.sendStatus(500);
        if (box) return res.status(200).send(box);
        return res.sendStatus(400);
    });
});
router.delete('/box/:id', (req, res) => {   //id and image must be passed
    Box.findOneAndRemove({_id: req.params.id}, (err, box) => {
        debug(req.body.id);
        if (err) {
            debug(err);
            return res.status(500).send(err);
        }
        else if (box) {
            rimraf.sync(path.join(__dirname, '../', req.body.image));
            return res.sendStatus(200);
        }
        else return res.sendStatus(404);
    });
});
router.get('/box', (req, res) => {
    Box.find((err, result) => {
        if (err) return res.sendStatus(500);
        return res.set({
            'Access-Control-Expose-Headers': 'x-total-count',
            'x-total-count': result.length
        }).status(200).send(replaceIdWith_IdInArray(result));
    })
});
router.get('/box/:id', (req, res) => {
    Box.findById(req.params.id,(err, result) => {
        if (err) return res.sendStatus(500);
        return res.status(200).send(replaceIdWith_Id(result));
    })
});


router.get('/pagingUsers/:leagueSpec/:limit/:page', (req, res) => {
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

router.get('/giveAwards/:leagueSpec',(req,res)=>{
    const league = req.params.leagueSpec;
    giveAwards(league).then(result=>{
        return res.sendStatus(200);
    }).catch(err=>{
        return res.sendStatus(err);
    })
});

router.get('/resizedImage',isAdmin,(req,res)=>{
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
