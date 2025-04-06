"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user = (0, express_1.Router)();
user.post("/signup", controllers_1.userController.signUp);
user.post("/login", controllers_1.userController.login);
user.get("/logout", controllers_1.userController.logout);
user.get("/me", auth_middleware_1.Authenticate, controllers_1.userController.profile);
user.get("/userByID/:id", controllers_1.userController.getUserByID);
exports.default = user;
