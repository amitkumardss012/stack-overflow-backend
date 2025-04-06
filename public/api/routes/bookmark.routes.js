"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const bookmark = (0, express_1.Router)();
bookmark.post("/create/:questionId", auth_middleware_1.Authenticate, controllers_1.bookmarkController.toggleBookmark);
bookmark.get("/all/:userId", controllers_1.bookmarkController.getAllBookmarks);
exports.default = bookmark;
