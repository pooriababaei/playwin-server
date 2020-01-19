import Debug from 'debug';
import _ from 'underscore';
import { ADVERTISE_REWARD_COUPON, NEWEST_APP_VERSION } from '../utils/globals';
import User from '../db/models/user';
const debug = Debug('User Controller:');

export function checkNewVersion(req, res) {
  if (req.params.version < NEWEST_APP_VERSION) {
    // there is a new version
    return res.status(200).json({
      code: 1,
      path: ''
    });
  }
  return res.status(200).json({
    code: 0
  });
}

export function getUser(req, res) {
  if (req.userId && req.userId !== req.params.id) {
    return res.sendStatus(400);
  }
  User.findById(req.params.id, (err, user) => {
    if (err) {
      res.sendStatus(500);
    } else if (user == null) {
      res.sendStatus(404);
    } else {
      res.status(200).json(user);
    }
  });
}

export async function getUsers(req, res) {
  let sort = null;
  let filter = null;

  if (req.query.sort) {
    sort = JSON.parse(req.query.sort);
  }
  if (req.query.filter) {
    filter = JSON.parse(req.query.filter);
  }
  let query = User.find();
  if (filter && filter.username) {
    query.find({
      username: {
        $regex: '.*' + filter.username + '.*'
      }
    });
  }
  if (filter && filter.phoneNumber) {
    query.find({
      phoneNumber: {
        $regex: '.*' + filter.phoneNumber + '.*'
      }
    });
  }
  let count = await User.find().countDocuments();
  if (sort) {
    query.sort([sort]);
  }
  query
    .skip((req.query.page - 1) * req.query.perPage)
    .limit(parseInt(req.query.perPage))
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
          'x-total-count': count
        })
        .status(200)
        .json(users);
    });
}

export function updateUser(req, res) {
  // need to be checked
  console.log('hello here');
  const info = _.pick(req.body, 'username', 'avatar', 'account');
  User.findOneAndUpdate(
    {
      _id: req.userId
    },
    {
      ...info
    },
    {
      new: true
    },
    (err, user) => {
      if (err) {
        res.sendStatus(400);
      } else if (!user) {
        res.sendStatus(404);
      } else {
        return res.status(200).send(user);
      }
    }
  );
}

export function usersCount(req, res) {
  User.find()
    .countDocuments()
    .then(c => {
      return res.status(200).send({
        count: c
      });
    })
    .catch(e => {
      debug(e);
      res.sendStatus(500);
    });
}

export function introduceInviter(req, res) {
  const inviterUsername = req.params.inviter;
  if (inviterUsername && typeof inviterUsername === 'string') {
    if (req.username === inviterUsername) {
      return res.sendStatus(400);
    }
    User.findOneAndUpdate(
      {
        username: inviterUsername
      },
      {
        $push: {
          invitingUsers: req.userId
        }
      }
    )
      .then(user => {
        if (user) {
          return res.sendStatus(200);
        }
        return res.sendStatus(404);
      })
      .catch(() => {
        return res.sendStatus(500);
      });
  } else {
    return res.sendStatus(400);
  }
}
