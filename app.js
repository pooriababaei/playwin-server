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

require('./dependencies');

const{isUserOrAdmin} = require('./dependencies/middleware');

const routes = {
    admin: require('./routes/admin'),
    user: require('./routes/user')

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
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,token,Authorization");
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

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(cookieParser());
//app.use('^\\/((user|admin)\\/.+$|public\\/((games|leagues)\\/([^/]+)\\/(([^/]+)$|images\\/([^/]+))$|([^/]+)\\/([^/]+)$))',isUserOrAdmin);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/ftp', express.static('public'), serve('public', {'icons': true}));

app.use('/api/admin', routes.admin);
app.use('/api/user', routes.user);

module.exports = app;
