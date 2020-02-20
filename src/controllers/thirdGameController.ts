import Debug from 'debug';
import _ from 'underscore';
import ThirdGame from '../db/models/thirdGame';
const debug = Debug('ThirdGame Controller:');

export function createThirdGame(req, res) {
  let mainImage;
  const info = _.pick(req.body, 'name', 'description', 'link', 'available');

  if (req.files && req.files.mainImage) {
    mainImage =
      '/public/thirdGames/' +
      req.body.name +
      '/' +
      req.files.mainImage[0].filename;
    info.mainImage = mainImage;
  }

  const gameToSave = new ThirdGame(info);
  gameToSave.save((err, game) => {
    if (err) {
      debug(err);
      return res.status(400).send();
    }
    return res.status(200).send(game);
  });
}

export function updateThirdGame(req, res) {
  let mainImage;
  const info = _.pick(req.body, 'name', 'description', 'link', 'available');

  if (req.files && req.files.mainImage) {
    mainImage =
      '/public/thirdGames/' +
      req.body.name +
      '/' +
      req.files.mainImage[0].filename;
    info.mainImage = mainImage;
  }

  ThirdGame.findOneAndUpdate(
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
