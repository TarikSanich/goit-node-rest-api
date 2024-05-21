import express from "express";
import AuthController from "../controllers/authControllers.js";

import authTokenUsePassport from "../middleware/authTokenUsePassport.js";

// midleware для репарсеру req.body
const jsonParser = express.json();

// створення об'єкта роутера express
const authRouter = express.Router();

// Маршрути
authRouter.post("/register", jsonParser, AuthController.registerUser);

authRouter.post("/login", jsonParser, AuthController.loginUser);

authRouter.post("/logout", authTokenUsePassport, AuthController.logoutUser);

authRouter.post("/current", authTokenUsePassport, AuthController.logoutUser);

authRouter.get("/current", authTokenUsePassport, AuthController.getCurrentUser);

authRouter.patch("/", authTokenUsePassport, AuthController.updateSubscription);

export default authRouter;