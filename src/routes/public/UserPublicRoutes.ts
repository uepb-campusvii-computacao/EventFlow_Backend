import express from "express";
import UserController from "../../controllers/UserController";

const UserPublicRoutes = express.Router();

UserPublicRoutes.post("/login",UserController.loginUser);
UserPublicRoutes.post("/register", UserController.registerUser);
UserPublicRoutes.post("/request-password-reset", UserController.requestPasswordReset);
UserPublicRoutes.post("/reset-password", UserController.resetPassword);

export default UserPublicRoutes;