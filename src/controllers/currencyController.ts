import Debug from 'debug';
import mongoose from 'mongoose';
import * as dbFunctions from '../utils/dbFunctions';
import {COINS_TRESHOLD_TO_EXCHANGE} from '../utils/globals';
const ToPay = mongoose.model('toPay');
const User = mongoose.model('user');
const Achievement = mongoose.model('achievement');
const debug = Debug('Currency Controller:');

export function exchangecouponsToLeagueOppo(req, res) {
    const league = req.league;
    const oppo = req.params.opportunities;

    dbFunctions.exchangecouponsToLeagueOppo(req.userId, oppo, league).then((result) => {
        res.status(200).json(result);
    }).catch((err) => {
        if (err === 1 || err === 2) {
            return res.status(400).send({
                code: err
            });
        }
        res.status(500).send(err.toString());
    }); // if throws 1 not enough oppo.
    // if throws 2 maxOpportunities bound(client mistake).
    // otherwise returns updated user and record
}

export function exchangecoinsToMoney(req, res) {
    const coins = parseInt(req.params.coins);
    try {
        if (isNaN(coins) || coins <= 0) {
            return res.sendStatus(400);
        }
        if (coins < COINS_TRESHOLD_TO_EXCHANGE) {
            return res.status(400).send({
                code: 1
            });
        } // Less than treshold for exchange. somehow is the client mistake.
        dbFunctions.exchangecoinsToMoney(req.userId, coins).then((result) => {
            res.status(200).send(result.toString());
        }).catch((err) => {
            if (err === 2) {
                return res.status(400).send({
                    code: err
                });
            }
            res.sendStatus(500);
        });
    } catch (e) {
        return res.sendStatus(500);
    }
}

export function giveRewards(req, res) {
    const collectionName = req.params.collectionName;
    dbFunctions.giveRewards(collectionName).then((result) => {
        return res.status(200).send(result);
    }).catch((err) => {
        debug(err)
        return res.sendStatus(500);
    });
}

export function achievements(req, res) {
    Achievement.find({}, (err, achievements) => {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).send(achievements);
    });
}

export async function achieve(req, res) {
    const achievementId = req.params.id;
    try {
        const achievement = await Achievement.findById(achievementId).lean();
        if (!achievement) {
            return res.sendStatus(400);
        }
        const user = await User.findOne({
            username: req.username
        });
        if (!user || (user.achievements != null && user.achievements.indexOf(achievementId) >= 0)) {
            return res.sendStatus(400);
        }
    } catch (e) {
        return res.sendStatus(400);
    }
    User.findOneAndUpdate({
        username: req.username
    }, {
        $push: {
            achievements: achievementId
        }
    }, {
        new: true
    }, (err, updatedUser) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (!updatedUser) {
            return res.sendStatus(400);
        }
        return res.status(200).send(updatedUser);
    });
}