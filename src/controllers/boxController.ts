import _ from 'underscore';
import Box from '../db/models/box';
import Debug from 'debug';
const debug = Debug('Box Controller:');

export function getBox(req, res) {
  Box.findById(req.params.id, (err, result) => {
    if (err) {
      return res.sendStatus(500);
    }
    return res.status(200).send(result);
  });
}

export function getBoxes(req, res) {
  Box.find((err, result) => {
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

export function createBox(req, res) {
  const info = _.pick(
    req.body,
    'type',
    'price',
    'offPrice',
    'coupon',
    'endTime'
  );
  const box = new Box(info);
  box.save((err, box) => {
    debug(err);
    if (err) {
      return res.sendStatus(500);
    }
    if (box) {
      return res.status(200).send(box);
    }
    return res.sendStatus(400);
  });
}

export function updateBox(req, res) {
  const info = _.pick(
    req.body,
    'type',
    'price',
    'offPrice',
    'coupon',
    'endTime'
  );
  Box.findOneAndUpdate(
    { _id: req.params.id },
    info,
    { new: true },
    (err, box) => {
      if (err) {
        return res.sendStatus(500);
      }
      if (box) {
        return res.status(200).send(box);
      }
      return res.sendStatus(400);
    }
  );
}

export function deleteBox(req, res) {
  Box.findOneAndRemove({ _id: req.params.id }, (err, box) => {
    if (err) {
      debug(err);
      return res.status(500).send(err);
    } else if (box) {
      return res.sendStatus(200);
    } else {
      return res.sendStatus(404);
    }
  });
}
