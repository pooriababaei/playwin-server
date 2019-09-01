let express = require('express');
let router = express.Router();
const {isAdmin, isUserOrAdmin} = require('../utils/middlewares');
const leagueController = require('../controllers/leagueController');
const debug = require('debug')('League Route:');

router
    .route('/')
    .get(isUserOrAdmin, leagueController.getLeagues)
    .post(isAdmin, leagueController.createLeague);
router
    .route('/:id')
    .get(isUserOrAdmin, leagueController.getLeague)
    .put(isAdmin, leagueController.updateLeague)
    .delete(isAdmin, leagueController.deleteLeague);

module.exports = router;
