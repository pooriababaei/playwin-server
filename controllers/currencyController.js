const dbFunctions = require('../utils/dbFunctions');
const debug = require('debug')('Currency Controller:');

function exchangeTotalOppoToLeagueOppo (req, res) {
    const league = req.league;
    const oppo = req.params.opportunities;
    debug(req.userId);
    debug(req.username);
    debug(oppo);
    debug(league);

    dbFunctions.exchangeTotalOppoToLeagueOppo(req.userId, req.username, oppo, league).then(result => {
        res.status(200).json(result);
    }).catch(err => {
        if(err === 1 || err === 2)
            return res.status(400).send({code:err});
        res.status(500).send(err.toString());
    });  //if throws 1 not enough oppo. if throws 2 max_opportunities bound(client mistake). otherwise returns updated user and record

}

function exchangeCoinToMoney (req, res) {
    const coins = parseInt(req.params.coins);
    try{
        if(isNaN(coins) || coins <=0) return res.sendStatus(400);
        if(coins < COIN_TRESHOLD_TO_EXCHANGE) return res.status(400).send({code: 1}); // Less than treshold for exchange. somehow is the client bug.
        dbFunctions.exchangeCoinToMoney(req.userId,coins).then(result=>{
            res.status(200).send(result.toString());
        }).catch(err => {
            debug(err);
            if(err == 2)
                return res.status(400).send({code: err});
            res.sendStatus(500);
        });
    }catch (e) {
        debug(e)
        return res.sendStatus(400);
    }
}

function giveAwards (req, res) {
    const leagueSpec = req.params.leagueSpec;
    dbFunctions.giveAwards(leagueSpec).then(result=> {
        return res.status(200).send(result);
    }).catch(err => {
        return res.sendStatus(err);
    });
}

module.exports = {
    exchangeCoinToMoney, exchangeTotalOppoToLeagueOppo, giveAwards
};