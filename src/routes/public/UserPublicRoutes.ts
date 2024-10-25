import express from "express";
import UserController from "../../controllers/UserController";

const UserPublicRoutes = express.Router();

UserPublicRoutes.post("/login",UserController.loginUser);
UserPublicRoutes.post("/register", UserController.registerUser);


export default UserPublicRoutes;