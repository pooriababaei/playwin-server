const express = require('express');
const path = require('path');
//const rfs = require('rotating-file-stream');
const bodyParser = require('body-parser');
//const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const serve = require('serve-index');

require('./db');
require('./utils');

const{isUserOrAdmin} = require('./utils/middlewares');

const routes = {
    admin: require('./routes/adminRoutes'),
    user: require('./routes/userRoutes'),
    league: require('./routes/leagueRoutes'),
    scoreboard: require('./routes/scoreboardRoutes'),
    box: require('./routes/boxRoutes'),
    game: require('./routes/gameRoutes'),
    currency: require('./routes/currencyRoutes'),
    payment: require('./routes/paymentRoutes')
};
let app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,Content-Size");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// create a rotating write stream
// var accessLogStream = rfs('access.log', {
//    interval: '1d', // rotate daily
//    path: path.join(__dirname, 'log'),
//    compress: "gzip"
//  });
  // setup the logger
//app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true,parameterLimit: 1000000}));
app.use(cookieParser());
app.use(/^.+\.(html|zip)$/,isUserOrAdmin);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/ftp', express.static('public'), serve('public', {'icons': true}));

app.use('/users', routes.user);
app.use('/admins', routes.admin);
app.use('/leagues',routes.league);
app.use('/games', routes.game);
app.use('/scoreboards',routes.scoreboard);
app.use('/currencies',routes.currency);
app.use('/boxes', routes.box);
app.use('/payments' , routes.payment);

module.exports = app;
