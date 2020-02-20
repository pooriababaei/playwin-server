import AdmZip from 'adm-zip';
import Debug from 'debug';
import path from 'path';
import rimraf from 'rimraf';
import _ from 'underscore';
import urljoin from 'url-join';
import Game from '../db/models/game';
const debug = Debug('Game Controller:');

export function getGame(req, res) {
  Game.findById(req.params.id, (err, game) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!game) {
      return res.sendStatus(404);
    }
    return res.status(200).json(game);
  });
}

export function getGames(req, res) {
  const gameState: any = {};
  if (req.query.hasOwnProperty('available')) {
    gameState.available = req.query.available;
  }
  Game.find(gameState, (err, games) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!games) {
      return res.sendStatus(404);
    }
    return res.status(200).json(games);
  });
}

export function createGame(req, res) {
  const images = [];
  let mainImage;
  let gif;
  let game;
  let gameZip;
  const info = _.pick(req.body, 'name', 'description', 'html');

  if (req.files && req.files.mainImage) {
    mainImage =
      '/public/games/' + req.body.name + '/' + req.files.mainImage[0].filename;
    info.mainImage = mainImage;
  }

  if (req.files && req.files.gif) {
    gif = '/public/games/' + req.body.name + '/' + req.files.gif[0].filename;
    info.gif = gif;
  }

  if (req.files && req.files.game) {
    const zip = new AdmZip(
      path.join(
        __dirname,
        '../../public/games/',
        req.body.name,
        req.files.game[0].originalname
      )
    );

    zip.extractAllTo(
      path.join(__dirname, '../../public/games/', req.body.name),
      /*overwrite*/ true
    );

    game = urljoin(
      '/public/games',
      req.body.name,
      req.files.game[0].originalname.split('.')[0],
      info.html
    );
    gameZip = urljoin(
      '/public/games',
      req.body.name,
      req.files.game[0].originalname
    );

    info.game = game;
    info.gameZip = gameZip;
  }

  if (req.files && req.files.images) {
    for (let i = 0; i < req.files.images.length; i++) {
      const temp =
        '/public/games/' +
        req.body.name +
        '/images/' +
        req.files.images[i].filename;
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
}

export function updateGame(req, res) {
  const images = [];
  let mainImage;
  let gif;
  let game;
  let gameZip;

  const info = _.pick(req.body, 'name', 'description', 'html');

  if (req.files && req.files.mainImage) {
    mainImage =
      '/public/games/' + req.body.name + '/' + req.files.mainImage[0].filename;
    info.mainImage = mainImage;
  }

  if (req.files && req.files.gif) {
    gif = '/public/games/' + req.body.name + '/' + req.files.gif[0].filename;
    info.gif = gif;
  }

  if (req.files && req.files.game) {
    const zip = new AdmZip(
      path.join(
        __dirname,
        '../../public/games/',
        req.body.name,
        req.files.game[0].originalname
      )
    );

    zip.extractAllTo(
      path.join(__dirname, '../../public/games/', req.body.name),
      /*overwrite*/ true
    );

    game = urljoin(
      '/public/games',
      req.body.name,
      req.files.game[0].originalname.split('.')[0],
      info.html
    );
    gameZip = urljoin(
      '/public/games',
      req.body.name,
      req.files.game[0].originalname
    );

    info.game = game;
    info.gameZip = gameZip;
  }

  if (req.files && req.files.images) {
    for (let i = 0; i < req.files.images.length; i++) {
      const temp =
        '/public/games/' +
        req.body.name +
        '/images/' +
        req.files.images[i].filename;
      images.push(temp);
    }
    info.images = images;
  }

  Game.findOneAndUpdate(
    {
      _id: req.params.id
    },
    info,
    {
      new: true
    },
    (err, game) => {
      if (err) {
        debug(err);
        return res.status(400).send();
      } else if (!game) {
        return res.sendStatus(404);
      }
      return res.status(200).send(game);
    }
  );
}

export function deleteGame(req, res) {
  Game.findOneAndRemove(
    {
      _id: req.params.id
    },
    (err, game) => {
      debug(req.body.id);
      if (err) {
        debug(err);
        return res.status(500).send(err);
      } else if (game) {
        rimraf.sync(path.join(__dirname, '../../public/games', game.name));
        return res.sendStatus(200);
      } else {
        return res.sendStatus(404);
      }
    }
  );
}
