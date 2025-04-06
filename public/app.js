"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Importing Routes
const middlewares_1 = require("./api/middlewares");
const routes_1 = require("./api/routes");
const config_1 = require("./config");
// All the Instances
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: [config_1.ENV.FRONTEND_URL, config_1.ENV.FRONTEND_URL1],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Hello world");
});
app.get("/health", (req, res) => {
    res.json({
        message: "Healthy"
    });
});
// All the Routes
app.use("/api/v1/user", routes_1.userRoutes);
app.use("/api/v1/question", routes_1.questionRoutes);
app.use("/api/v1/answer", routes_1.answerRoutes);
app.use("/api/v1/bookmark", routes_1.bookmarkRoutes);
app.use(middlewares_1.errorMiddleware);
app.all("*", (req, res) => {
    res.status(404).json({
        message: "route not found"
    });
});
exports.default = app;
