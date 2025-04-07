import { Router } from "express";
import { userController } from "../controllers";
import { Authenticate } from "../middlewares/auth.middleware";

const user = Router();

user.post("/signup", userController.signUp);
user.post("/login", userController.login);
user.get("/logout", userController.logout);
user.get("/me", Authenticate, userController.profile);
user.put("/update/:id", Authenticate, userController.updateUser);
user.get("/userByID/:id", userController.getUserByID);

export default user;