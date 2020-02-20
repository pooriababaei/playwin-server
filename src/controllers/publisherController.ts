import _ from 'underscore';
import Publisher from '../db/models/publisher';
import bcrypt from 'bcryptjs';
import Debug from 'debug';
const debug = Debug('Publisher Controller:');

export function createPublisher(req, res) {
  const info = _.pick(
    req.body,
    'name',
    'username',
    'phone',
    'password',
    'email'
  );
  const publisher = new Publisher(info);
  publisher.save((err, publisher) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(publisher);
  });
}

export function updatePublisher(req, res) {
  const info = _.pick(req.body, 'username', 'phone', 'password', 'email');
  if (info.password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(info.password, salt);
    info.password = hash;
  }
  Publisher.findOneAndUpdate(
    { _id: req.params.id },
    info,
    { new: true },
    (err, publisher) => {
      if (err) {
        return res.status(400).send(err);
      }
      res.status(200).send(publisher);
    }
  );
}

export function deletePublisher(req, res) {
  Publisher.findOneAndRemove({ _id: req.params.id }, (err, publisher) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(publisher);
  });
}
