import Debug from 'debug';
import mongoose from 'mongoose';
import _ from 'underscore';
const debug = Debug('Payment Controller:');
const ToPay = mongoose.model('toPay');

export async function getToPays(req, res) {
    let sort = null;
    let filter = null;

    if (req.query.sort) {
        sort = JSON.parse(req.query.sort);
    }
    if (req.query.filter) {
        filter = JSON.parse(req.query.filter);
    }

    let query = ToPay.find();
    if (filter) {
        query.find(filter);
    }
    let count = await ToPay.find().countDocuments();
    if (sort) {
        query.sort([sort]);
    }
    query.skip((req.query.page - 1) * req.query.perPage).limit(parseInt(req.query.perPage))
        .populate({
            path: 'user',
            select: 'username phoneNumber account'
        }).exec((err, toPays) => {
            if (err) {
                return res.sendStatus(500);
            }

            if (!toPays) {
                return res.sendStatus(404);
            }
            return res.set({
                'Access-Control-Expose-Headers': 'x-total-count',
                'x-total-count': count
            }).status(200).json(toPays);
        });

}

export function updatePayment(req, res) {
    const payId = req.params.id;
    const info = _.pick(req.body, 'paid', 'payTime');
    ToPay.findOneAndUpdate({
        _id: payId
    }, info, {
        new: true
    }).populate({
        path: 'user',
        select: 'username phoneNumber account'
    }).exec((err, result) => {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(result);
    });
}

export async function notPaidsNumber(req, res) {
    const num = await ToPay.find({
        paid: false
    }).countDocuments();
    return res.status(200).send({
        count: num
    });
}