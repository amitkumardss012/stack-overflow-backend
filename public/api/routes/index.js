"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = exports.questionRoutes = exports.bookmarkRoutes = exports.answerRoutes = void 0;
const answer_routes_1 = __importDefault(require("./answer.routes"));
exports.answerRoutes = answer_routes_1.default;
const bookmark_routes_1 = __importDefault(require("./bookmark.routes"));
exports.bookmarkRoutes = bookmark_routes_1.default;
const question_routes_1 = __importDefault(require("./question.routes"));
exports.questionRoutes = question_routes_1.default;
const user_routes_1 = __importDefault(require("./user.routes"));
exports.userRoutes = user_routes_1.default;
