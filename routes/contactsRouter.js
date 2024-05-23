import express from "express";
import ContactsController from "../controllers/contactsControllers.js";
import authTokenUsePassport from "../middleware/authTokenUsePassport.js";

const jsonParser = express.json();
const contactsRouter = express.Router();

// Маршрут для отримання всіх контактів
contactsRouter.get(
  "/",
  authTokenUsePassport,
  ContactsController.getAllContacts
);

// Маршрут для отримання одного контакту за id та owner
contactsRouter.get(
  "/:id",
  authTokenUsePassport,
  ContactsController.getOneContact
);

// Маршрут для видалення контакту за id та owner
contactsRouter.delete(
  "/:id",
  authTokenUsePassport,
  ContactsController.deleteContact
);

// Маршрут для створення нового контакту
contactsRouter.post(
  "/",
  jsonParser,
  authTokenUsePassport,
  ContactsController.createContact
);

// Маршрут для оновлення контакту за id та owner
contactsRouter.put(
  "/:id",
  jsonParser,
  authTokenUsePassport,
  ContactsController.updateContact
);

// Маршрут для оновлення статусу контакту (favorite) за id та owner
contactsRouter.patch(
  "/:id/favorite", // Зміна параметра маршруту на "/:id/favorite"
  jsonParser,
  authTokenUsePassport,
  ContactsController.updateContactFavoriteStatus
);

export default contactsRouter;
