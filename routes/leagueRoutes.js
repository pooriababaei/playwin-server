let express = require('express');
let router = express.Router();
const {isAdmin, isUserOrAdmin} = require('../utils/middlewares');
const {leagueUpload} = require('../utils/fileUpload');
const leagueController = require('../controllers/leagueController');
const debug = require('debug')('League Route:');

router
    .route('/')
    .get(isUserOrAdmin, leagueController.getLeagues)
    .post(isAdmin,leagueUpload, leagueController.createLeague);
router
    .route('/:id')
    .get(isUserOrAdmin, leagueController.getLeague)
    .put(isAdmin, leagueUpload, leagueController.updateLeague)
    .delete(isAdmin, leagueController.deleteLeague);

module.exports = router;
