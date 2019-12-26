"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var mongoose_1 = __importDefault(require("mongoose"));
var dbConfig_1 = require("./dbConfig");
var debug = debug_1.default('Mondb:');
mongoose_1.default.set('useNewUrlParser', true);
mongoose_1.default.set('useFindAndModify', false);
mongoose_1.default.set('useCreateIndex', true);
// mongoose.set('debug', true);
mongoose_1.default.Promise = global.Promise;
require("./models/achievement");
require("./models/admin");
require("./models/auth");
require("./models/box");
require("./models/boxPurchase");
require("./models/game");
require("./models/job");
require("./models/league");
var scoreboard_1 = require("./models/scoreboard");
require("./models/toPay");
require("./models/user");
require("./models/weeklyLeader");
var league_1 = __importDefault(require("./models/league"));
//const League = mongoose.model("league");
// mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000, useUnifiedTopology: true}).then(() => {
mongoose_1.default
    .connect(dbConfig_1.dbUrl, {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useUnifiedTopology: true,
    replicaSet: 'rs0',
    user: 'admin',
    pass: 'Playwin@2019',
    authSource: 'admin'
})
    .then(function () {
    league_1.default.find(function (err, leagues) {
        if (err) {
            debug(err);
        }
        if (!err) {
            leagues.forEach(function (item) {
                scoreboard_1.scoreboardModel(item.collectionName, item.defaultOpportunity);
            });
        }
        debug('database connected :)');
    });
})
    .catch(function (err) {
    debug(err);
});
exports.default = mongoose_1.default;
//# sourceMappingURL=mondb.js.map