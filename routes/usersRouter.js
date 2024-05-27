import express from "express";
import UserController from "../controllers/userController.js";
import uploadMiddleware from "../middleware/upload.js";


const router = express.Router();


router.patch("/avatars", uploadMiddleware.single("avatar"), UserController.updateAvatar);

export default router;