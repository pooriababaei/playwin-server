"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var dotenv_1 = __importDefault(require("dotenv"));
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var serve_index_1 = __importDefault(require("serve-index"));
require("./db");
var routes = __importStar(require("./routes"));
var middlewares_1 = require("./utils/middlewares");
var onstart_1 = require("./utils/onstart");
dotenv_1.default.config();
onstart_1.run();
var app = express_1.default();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,Content-Size");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000
}));
app.use(cookie_parser_1.default());
app.use(/^.+\.(html|zip)$/, middlewares_1.isUserOrAdmin);
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use("/ftp", express_1.default.static("public"), serve_index_1.default("public", { icons: true }));
app.use("/users", routes.userRoutes);
app.use("/admins", routes.adminRoutes);
app.use("/leagues", routes.leagueRoutes);
app.use("/games", routes.gameRoutes);
app.use("/scoreboards", routes.scoreboardRoutes);
app.use("/currencies", routes.currencyRoutes);
app.use("/boxes", routes.boxRoutes);
app.use("/payments", routes.paymentRoutes);
exports.default = app;
//# sourceMappingURL=app.js.map