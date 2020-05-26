import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import serve from 'serve-index';
import './db';
import * as routes from './routes';
import { isUserOrAdmin } from './utils/middlewares';
import { run } from './utils/onstart';

dotenv.config();
run();

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept,Authorization,Content-Size'
  );
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000000,
  })
);
app.use(cookieParser());
app.use(/^.+\.(html|zip)$/, isUserOrAdmin);
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/ftp', express.static('public'), serve('public', { icons: true }));

app.use('/users', routes.userRoutes);
app.use('/admins', routes.adminRoutes);
app.use('/publishers', routes.publisherRoutes);
app.use('/publisherGames', routes.publisherGameRoutes);
app.use('/leagues', routes.leagueRoutes);
app.use('/publisherLeagues', routes.leagueRoutes);
app.use('/games', routes.gameRoutes);
app.use('/scoreboards', routes.scoreboardRoutes);
app.use('/currencies', routes.currencyRoutes);
app.use('/boxes', routes.boxRoutes);
app.use('/payments', routes.paymentRoutes);

export default app;
