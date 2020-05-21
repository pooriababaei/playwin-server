import Debug from 'debug';
import _ from 'underscore';
import PublisherGame from '../db/models/publisherGame';
const debug = Debug('PublisherGame Controller:');

export function createPublisherGame(req, res) {
  let mainImage;
  const info = _.pick(req.body, 'name', 'description', 'link', 'available');

  if (req.files && req.files.mainImage) {
    mainImage = '/public/publisherGames/' + req.body.name + '/' + req.files.mainImage[0].filename;
    info.mainImage = mainImage;
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
    mainImage = '/public/publisherGames/' + req.body.name + '/' + req.files.mainImage[0].filename;
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
