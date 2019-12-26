"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var adm_zip_1 = __importDefault(require("adm-zip"));
var debug_1 = __importDefault(require("debug"));
var path_1 = __importDefault(require("path"));
var rimraf_1 = __importDefault(require("rimraf"));
var underscore_1 = __importDefault(require("underscore"));
var url_join_1 = __importDefault(require("url-join"));
var game_1 = __importDefault(require("../db/models/game"));
var debug = debug_1.default("Game Controller:");
function getGame(req, res) {
    game_1.default.findById(req.params.id, function (err, game) {
        if (err) {
            return res.sendStatus(500);
        }
        if (!game) {
            return res.sendStatus(404);
        }
        return res.status(200).json(game);
    });
}
exports.getGame = getGame;
function getGames(req, res) {
    var gameState = {};
    if (req.query.hasOwnProperty("available")) {
        gameState.available = req.query.available;
    }
    game_1.default.find(gameState, function (err, games) {
        if (err) {
            return res.sendStatus(500);
        }
        if (!games) {
            return res.sendStatus(404);
        }
        return res.status(200).json(games);
    });
}
exports.getGames = getGames;
function createGame(req, res) {
    var images = [];
    var mainImage;
    var gif;
    var game;
    var gameZip;
    var info = underscore_1.default.pick(req.body, "name", "description", "html");
    if (req.files && req.files.mainImage) {
        mainImage =
            "/public/games/" + req.body.name + "/" + req.files.mainImage[0].filename;
        info.mainImage = mainImage;
    }
    if (req.files && req.files.gif) {
        gif = "/public/games/" + req.body.name + "/" + req.files.gif[0].filename;
        info.gif = gif;
    }
    if (req.files && req.files.game) {
        var zip = new adm_zip_1.default(path_1.default.join(__dirname, "../../public/games/", req.body.name, req.files.game[0].originalname));
        zip.extractAllTo(path_1.default.join(__dirname, "../../public/games/", req.body.name), 
        /*overwrite*/ true);
        game = url_join_1.default("/public/games", req.body.name, req.files.game[0].originalname.split(".")[0], info.html);
        gameZip = url_join_1.default("/public/games", req.body.name, req.files.game[0].originalname);
        info.game = game;
        info.gameZip = gameZip;
    }
    if (req.files && req.files.images) {
        for (var i = 0; i < req.files.images.length; i++) {
            var temp = "/public/games/" +
                req.body.name +
                "/images/" +
                req.files.images[i].filename;
            images.push(temp);
        }
        info.images = images;
    }
    var gameToSave = new game_1.default(info);
    gameToSave.save(function (err, game) {
        if (err) {
            debug(err);
            return res.status(400).send();
        }
        return res.status(200).send(game);
    });
}
exports.createGame = createGame;
function updateGame(req, res) {
    var images = [];
    var mainImage;
    var gif;
    var game;
    var gameZip;
    var info = underscore_1.default.pick(req.body, "name", "description", "html");
    if (req.files && req.files.mainImage) {
        mainImage =
            "/public/games/" + req.body.name + "/" + req.files.mainImage[0].filename;
        info.mainImage = mainImage;
    }
    if (req.files && req.files.gif) {
        gif = "/public/games/" + req.body.name + "/" + req.files.gif[0].filename;
        info.gif = gif;
    }
    if (req.files && req.files.game) {
        var zip = new adm_zip_1.default(path_1.default.join(__dirname, "../../public/games/", req.body.name, req.files.game[0].originalname));
        zip.extractAllTo(path_1.default.join(__dirname, "../../public/games/", req.body.name), 
        /*overwrite*/ true);
        game = url_join_1.default("/public/games", req.body.name, req.files.game[0].originalname.split(".")[0], info.html);
        gameZip = url_join_1.default("/public/games", req.body.name, req.files.game[0].originalname);
        info.game = game;
        info.gameZip = gameZip;
    }
    if (req.files && req.files.images) {
        for (var i = 0; i < req.files.images.length; i++) {
            var temp = "/public/games/" +
                req.body.name +
                "/images/" +
                req.files.images[i].filename;
            images.push(temp);
        }
        info.images = images;
    }
    game_1.default.findOneAndUpdate({
        _id: req.params.id
    }, info, {
        new: true
    }, function (err, game) {
        if (err) {
            debug(err);
            return res.status(400).send();
        }
        else if (!game) {
            return res.sendStatus(404);
        }
        return res.status(200).send(game);
    });
}
exports.updateGame = updateGame;
function deleteGame(req, res) {
    game_1.default.findOneAndRemove({
        _id: req.params.id
    }, function (err, game) {
        debug(req.body.id);
        if (err) {
            debug(err);
            return res.status(500).send(err);
        }
        else if (game) {
            rimraf_1.default.sync(path_1.default.join(__dirname, "../../public/games", game.name));
            return res.sendStatus(200);
        }
        else {
            return res.sendStatus(404);
        }
    });
}
exports.deleteGame = deleteGame;
//# sourceMappingURL=gameController.js.map