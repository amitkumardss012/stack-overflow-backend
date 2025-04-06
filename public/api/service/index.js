"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.QuestionService = exports.BookmarkService = exports.AnswerService = void 0;
const answer_service_1 = __importDefault(require("./answer.service"));
exports.AnswerService = answer_service_1.default;
const bookmark_service_1 = __importDefault(require("./bookmark.service"));
exports.BookmarkService = bookmark_service_1.default;
const question_service_1 = __importDefault(require("./question.service"));
exports.QuestionService = question_service_1.default;
const user_service_1 = __importDefault(require("./user.service"));
exports.UserService = user_service_1.default;
