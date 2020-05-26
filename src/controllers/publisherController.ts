import _ from 'underscore';
import Publisher from '../db/models/publisher';
import bcrypt from 'bcryptjs';
import Debug from 'debug';
const debug = Debug('Publisher Controller:');

export function createPublisher(req, res) {
  const info = _.pick(req.body, 'name', 'username', 'publisherGame', 'phone', 'password', 'email');
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
  Publisher.findOneAndUpdate({ _id: req.params.id }, info, { new: true }, (err, publisher) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(publisher);
  });
}

export function deletePublisher(req, res) {
  Publisher.findOneAndRemove({ _id: req.params.id }, (err, publisher) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(publisher);
  });
}

export function getPublisher(req, res) {
  if (req.userId && req.userId !== req.params.id) {
    return res.sendStatus(400);
  }
  Publisher.findById(req.params.id, (err, user) => {
    if (err) {
      res.sendStatus(500);
    } else if (user == null) {
      res.sendStatus(404);
    } else {
      res.status(200).json(user);
    }
  });
}

export async function getPublishers(req, res) {
  let sort = null;
  let filter = null;

  if (req.query.sort) {
    sort = JSON.parse(req.query.sort);
  }
  if (req.query.filter) {
    filter = JSON.parse(req.query.filter);
  }
  let query = Publisher.find();
  if (filter && filter.username) {
    query.find({
      username: {
        $regex: '.*' + filter.username + '.*',
      },
    });
  }
  if (filter && filter.phone) {
    query.find({
      phone: {
        $regex: '.*' + filter.phone + '.*',
      },
    });
  }
  let count = await Publisher.find().countDocuments();
  if (sort) {
    query.sort([sort]);
  }
  query
    .skip((req.query.page - 1) * req.query.perPage)
    .limit(+req.query.perPage)
    .exec((err, users) => {
      if (err) {
        return res.sendStatus(500);
      }
      if (!users) {
        return res.sendStatus(404);
      }
      return res
        .set({
          'Access-Control-Expose-Headers': 'x-total-count',
          'x-total-count': count,
        })
        .status(200)
        .json(users);
    });
}

export function login(req, res) {
  if (req.body.hasOwnProperty('password')) {
    const pass = req.body.password;
    if (req.body.hasOwnProperty('username')) {
      const usernameOrEmail = req.body.username;
      Publisher.findByUsername(usernameOrEmail, pass)
        .then((publisher) => {
          const token = publisher.generateToken();
          return res.status(200).send({ token });
        })
        .catch(() => {
          Publisher.findByEmail(usernameOrEmail, pass)
            .then((publisher) => {
              const token = publisher.generateToken();
              return res.status(200).send({ token });
            })
            .catch(() => {
              return res.sendStatus(401);
            });
        });
    } else {
      return res.status(400).send();
    }
  } else {
    return res.status(400).send();
  }
}
