var express = require('express');
var path = require('path');
var rfs = require('rotating-file-stream');
const bodyParser = require('body-parser');
const fs = require('fs');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var serve = require('serve-index');
var RateLimit = require('express-rate-limit');
var RedisStore = require('rate-limit-redis');

require('./db');

const{isUserOrAdmin} = require('./utils/middlewares');

const routes = {
    admin: require('./routes/adminRoutes'),
    user: require('./routes/userRoutes'),
    league: require('./routes/leagueRoutes'),
    scoreboard: require('./routes/scoreboardRoutes'),
    box: require('./routes/boxRoutes'),
    game: require('./routes/gameRoutes'),
    currency: require('./routes/currencyRoutes')
};
var app = express();

// var limiter = new RateLimit({
//     store: new RedisStore({
//       // see Configuration
//       expiry : 30  //seconds
//     }),
//     max: 200, // limit each IP to 100 requests per windowMs
//     delayMs: 0 // disable delaying - full speed until the max limit is reached
//   });
//
//   //  apply to all requests
  //  app.use('^\\/((api\/user|api\/admin)\\/.+$|public\\/((games|leagues)\\/([^/]+)\\/(([^/]+)$|images\\/([^/]+))$|([^/]+)\\/([^/]+)$))',limiter);  // returns 429 if reach maximum reqs.

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,accept,token,Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log'),
    compress: "gzip"
  });
  // setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true,parameterLimit: 1000000}));
app.use(cookieParser());
app.use('^\\/.+\\.(html|zip)$',isUserOrAdmin);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/ftp', express.static('public'), serve('public', {'icons': true}));

app.use('/users', routes.user);
app.use('/admins', routes.admin);
app.use('/leagues',routes.league);
app.use('/scoreboards',routes.scoreboard);
app.use('/currencies',routes.currency);
app.use('/boxes', routes.box);
app.use('/games', routes.game);

module.exports = app;
