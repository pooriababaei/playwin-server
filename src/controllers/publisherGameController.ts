import Debug from 'debug';
import _ from 'underscore';
import PublisherGame from '../db/models/publisherGame';
const debug = Debug('PublisherGame Controller:');

export function getPublisherGame(req, res) {
  PublisherGame.findById(req.params.id, (err, game) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!game) {
      return res.sendStatus(404);
    }
    return res.status(200).json(game);
  });
}

export function getPublishersGames(req, res) {
  const gameState: any = {};
  if (req.query.hasOwnProperty('available')) {
    gameState.available = req.query.available;
  }
  PublisherGame.find(gameState, (err, games) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!games) {
      return res.sendStatus(404);
    }
    return res.status(200).json(games);
  });
}

export function createPublisherGame(req, res) {
  let image;
  const info = _.pick(req.body, 'name', 'description', 'link', 'available');

  if (req.files && req.files.image) {
    image = '/public/publisherGameImages/' + req.body.name + '/' + req.files.image[0].filename;
    info.image = image;
  }

  const gameToSave = new PublisherGame(info);
  gameToSave.save((err, game) => {
    if (err) {
      debug(err);
      return res.status(400).send();
    }
    return res.status(200).send(game);
  });
}

export function updatePublisherGame(req, res) {
  let mainImage;
  const info = _.pick(req.body, 'name', 'description', 'link', 'available');

  if (req.files && req.files.mainImage) {
    mainImage =
      '/public/publisherGameImages/' + req.body.name + '/' + req.files.mainImage[0].filename;
    info.mainImage = mainImage;
  }

  PublisherGame.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    info,
    {
      new: true,
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

export function deletePublisherGame(req, res) {
  PublisherGame.findOneAndRemove(
    {
      _id: req.params.id,
    },
    (err, game) => {
      debug(req.body.id);
      if (err) {
        debug(err);
        return res.status(500).send(err);
      } else if (game) {
        return res.sendStatus(200);
      } else {
        return res.sendStatus(404);
      }
    }
  );
}
