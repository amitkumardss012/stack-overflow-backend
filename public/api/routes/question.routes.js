"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const question = (0, express_1.Router)();
question.post("/ask", auth_middleware_1.Authenticate, controllers_1.questionController.AskQuestion);
question.get("/all", controllers_1.questionController.GetAllQuestions);
question.get("/user/:userId", controllers_1.questionController.questionByUserId);
question.get("/search", controllers_1.questionController.serachQuestion);
question.get("/:id", controllers_1.questionController.getQuestionById);
question.delete("/:id", auth_middleware_1.Authenticate, controllers_1.questionController.deleteQuestion);
// question.route("/:id").get(questionController.getQuestionById);
exports.default = question;
