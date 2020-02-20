import _ from 'underscore';
import Admin from '../db/models/admin';
import bcrypt from 'bcryptjs';
import Debug from 'debug';
const debug = Debug('Admin Controller:');

export function getAdmin(req, res) {
  Admin.findById(req.params.id, (err, result) => {
    if (err) {
      return res.sendStatus(500);
    }
    return res.status(200).send(result);
  });
}

export function getAdmins(req, res) {
  Admin.find((err, result) => {
    if (err) {
      return res.sendStatus(500);
    }
    return res
      .set({
        'Access-Control-Expose-Headers': 'x-total-count',
        'x-total-count': result.length
      })
      .status(200)
      .send(result);
  });
}

export function createAdmin(req, res) {
  const info = _.pick(
    req.body,
    'name',
    'username',
    'phone',
    'password',
    'email',
    'role'
  );
  const admin = new Admin(info);
  admin.save((err, admin) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(admin);
  });
}

export function updateAdmin(req, res) {
  const info = _.pick(
    req.body,
    'name',
    'username',
    'phone',
    'password',
    'email',
    'role'
  );
  if (info.password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(info.password, salt);
    info.password = hash;
  }
  Admin.findOneAndUpdate(
    { _id: req.params.id },
    info,
    { new: true },
    (err, admin) => {
      if (err) {
        return res.status(400).send(err);
      }
      res.status(200).send(admin);
    }
  );
}

export function deleteAdmin(req, res) {
  Admin.findOneAndRemove({ _id: req.params.id }, (err, admin) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(admin);
  });
}
