import express from "express";
import ContactsController from "../controllers/contactsControllers.js";
import authTokenUsePassport from "../middleware/authTokenUsePassport.js";

// локальний імопрт midleware express для репарсеру req.body
const jsonParser = express.json();

// створити екземпляр роутера
const contactsRouter = express.Router();

// додаємо мідлвари: jsonParser - в методи де є зчитування reg.body в запитах,
// authTokenUsePassport - де потрібна авторізація
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
  "/:contactId/favorite",
  jsonParser,
  authTokenUsePassport,
  ContactsController.updateContactFavoriteStatus
);

export default contactsRouter;