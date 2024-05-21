import express from "express";
import AuthController from "../controllers/authControllers.js";

import authTokenUsePassport from "../middleware/authTokenUsePassport.js";


const jsonParser = express.json();


const authRouter = express.Router();


authRouter.post("/register", jsonParser, AuthController.registerUser);

authRouter.post("/login", jsonParser, AuthController.loginUser);

authRouter.post("/logout", authTokenUsePassport, AuthController.logoutUser);

authRouter.post("/current", authTokenUsePassport, AuthController.logoutUser);

authRouter.get("/current", authTokenUsePassport, AuthController.getCurrentUser);

authRouter.patch("/", authTokenUsePassport, AuthController.updateSubscription);

export default authRouter;