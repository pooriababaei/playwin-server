"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var dbConfig_1 = require("./db/dbConfig");
var debug = debug_1.default('Mondb:');
var mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set('useNewUrlParser', true);
mongoose_1.default.set('useFindAndModify', false);
mongoose_1.default.set('useCreateIndex', true);
mongoose_1.default.Promise = global.Promise;
var league_1 = __importDefault(require("./db/models/league"));
var admin_1 = __importDefault(require("./db/models/admin"));
var scoreboard_1 = require("./db/models/scoreboard");
//import { League } from './interfaces/league';
// mongoose.connect(dbUrl,{ keepAlive: true, keepAliveInitialDelay: 300000}).then(() => {
mongoose_1.default
    .connect(dbConfig_1.dbUrl, {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    replicaSet: 'rs0',
    useUnifiedTopology: true
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
        createSuperAdmin().then(function () {
            console.log('done');
        });
    });
})
    .catch(function (err) {
    debug(err);
});
function createSuperAdmin() {
    return __awaiter(this, void 0, void 0, function () {
        var admin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    admin = new admin_1.default({
                        username: 'pooriya',
                        password: 'Playwin@2019',
                        name: 'pooriya babaei',
                        email: 'pooriya.babaei.1997@gmail.com',
                        phone: '09139236452',
                        role: 'superadmin'
                    });
                    return [4 /*yield*/, admin.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
function f() {
    return __awaiter(this, void 0, void 0, function () {
        var st, Scoreboard, i, record, en;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    st = Date.now();
                    Scoreboard = mongoose_1.default.model('superleague');
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 600000)) return [3 /*break*/, 4];
                    record = new Scoreboard({
                        user: '5cd48dbf6b63f015483125a1',
                        username: 'nabi',
                        score: Math.floor(Math.random() * 10000),
                        opportunity: i,
                        avatar: Math.floor(Math.random() * 3)
                    });
                    return [4 /*yield*/, record.save()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    en = Date.now();
                    console.log(en - st);
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=SuperAdminScript.js.map