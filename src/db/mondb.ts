import Debug from 'debug';
import mongoose from 'mongoose';
import { dbUrl } from './dbConfig';
const debug = Debug('Mondb:');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// mongoose.set('debug', true);
mongoose.Promise = global.Promise;

import './models/achievement';
import './models/admin';
import './models/auth';
import './models/box';
import './models/boxPurchase';
import './models/game';
import './models/job';
import './models/league';
import './models/publisherLeague';
import { scoreboardModel } from './models/scoreboard';
import './models/toPay';
import './models/user';
import './models/weeklyReward';
import League from './models/league';

// mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000, useUnifiedTopology: true}).then(() => {
mongoose
  .connect(dbUrl, {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useUnifiedTopology: true,
    //  replicaSet: 'rs0',
    user: 'admin',
    pass: 'Nem@dino2020',
    authSource: 'admin',
  })
  .then(() => {
    League.find((err, leagues) => {
      if (err) {
        debug(err);
      }
      if (!err) {
        leagues.forEach((item) => {
          scoreboardModel(item.collectionName, item.defaultOpportunity - 1);
        });
      }
      console.log('database connected :)');
    });
  })
  .catch((err) => {
    debug(err);
  });

export default mongoose;
