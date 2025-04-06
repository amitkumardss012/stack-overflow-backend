import { Router } from "express";
import { bookmarkController } from "../controllers";
import { Authenticate } from "../middlewares/auth.middleware";

const bookmark = Router();

bookmark.post("/create/:questionId", Authenticate, bookmarkController.toggleBookmark);
bookmark.get("/all/:userId", bookmarkController.getAllBookmarks);

export default bookmark;