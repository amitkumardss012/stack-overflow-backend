import { Router } from "express";
import { questionController } from "../controllers";
import { Authenticate } from "../middlewares/auth.middleware";

const question = Router();

question.post("/ask", Authenticate, questionController.AskQuestion)
question.get("/all", questionController.GetAllQuestions)
question.get("/user/:userId", questionController.questionByUserId)
question.get("/search", questionController.serachQuestion)
question.get("/:id", questionController.getQuestionById)
question.delete("/:id", Authenticate, questionController.deleteQuestion)

// question.route("/:id").get(questionController.getQuestionById);


export default question;