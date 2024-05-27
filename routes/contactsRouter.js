import express from "express";
import ContactsController from "../controllers/contactsControllers.js";
import authTokenUsePassport from "../middleware/authTokenUsePassport.js";

const jsonParser = express.json();
const contactsRouter = express.Router();

contactsRouter.get(
  "/",
  authTokenUsePassport,
  ContactsController.getAllContacts
);

contactsRouter.get(
  "/:id",
  authTokenUsePassport,
  ContactsController.getOneContact
);

contactsRouter.delete(
  "/:id",
  authTokenUsePassport,
  ContactsController.deleteContact
);

contactsRouter.post(
  "/",
  jsonParser,
  authTokenUsePassport,
  ContactsController.createContact
);

contactsRouter.put(
  "/:id",
  jsonParser,
  authTokenUsePassport,
  ContactsController.updateContact
);

contactsRouter.patch(
  "/:id/favorite", 
  jsonParser,
  authTokenUsePassport,
  ContactsController.updateContactFavoriteStatus
);

export default contactsRouter;
