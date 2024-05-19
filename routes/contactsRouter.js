import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateContactFavoriteStatus,
} from "../controllers/contactsControllers.js";
import authMiddleware from "../middleware/auth.js";

const jsonParser = express.json();

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", getOneContact);

contactsRouter.delete("/:id", deleteContact);

contactsRouter.post("/", jsonParser, createContact);

contactsRouter.put("/:id", jsonParser, updateContact);

contactsRouter.put("/:id", authMiddleware, updateContact);

contactsRouter.patch("/:id/favorite", jsonParser, updateContactFavoriteStatus);

export default contactsRouter;