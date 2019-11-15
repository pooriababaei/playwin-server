import Debug from 'debug';
import express from 'express';
import * as gameController from '../controllers/gameController';
import {gameUpload} from '../utils/fileUpload';
import {isAdmin, isUserOrAdmin} from '../utils/middlewares';
let router = express.Router();
const debug = Debug('League Route:');

router
    .route('/')
    .get(isUserOrAdmin, gameController.getGames)
    .post(isAdmin,gameUpload, gameController.createGame);
router
    .route('/:id')
    .get(isUserOrAdmin, gameController.getGame)
    .put(isAdmin,gameUpload, gameController.updateGame)
    .delete(isAdmin, gameController.deleteGame);

export default router;