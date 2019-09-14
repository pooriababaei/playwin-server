let express = require('express');
let router = express.Router();
const {isAdmin, isUserOrAdmin} = require('../utils/middlewares');
const {gameUpload} = require('../utils/fileUpload');
const gameController = require('../controllers/gameController');
const debug = require('debug')('League Route:');

router
    .route('/')
    .get(isUserOrAdmin, gameController.getGames)
    .post(isAdmin,gameUpload, gameController.createGame);
router
    .route('/:id')
    .get(isUserOrAdmin, gameController.getGame)
    .put(isAdmin,gameUpload, gameController.updateGame)
    .delete(isAdmin, gameController.deleteGame);

module.exports = router;
