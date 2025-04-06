import { Router } from "express";
import { answerController } from "../controllers";
import { Authenticate } from "../middlewares/auth.middleware";

const answer = Router();

answer.post("/create/:questionId" , Authenticate, answerController.createAnswer)
answer.get("/user/:userId", answerController.answerByUserId)
answer.get("/all/:questionId", answerController.getAnswersByQuestion)

export default answer;