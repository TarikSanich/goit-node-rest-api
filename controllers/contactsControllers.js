import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  validateFavoriteBody,
} from "../schemas/contactsSchemas.js";
import Contact from "../models/Contact.js";

import mongoose from "mongoose";

// GET /api/contacts
// GET /contacts?page=1&limit=20
// GET /contacts?favorite=true
export const getAllContacts = async (req, res, next) => {
  try {
    // імпорт параметрів запиту page та limit з url запиту
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // or default limit is 20

    // Отримання ідентифікатора користувача з об'єкта запиту
    const userId = req.user.id;

    // Створення об'єкта для фільтрації з основним фільтром за власником контактів
    const filter = { owner: userId };

    // Отримання значення поля favorite з запиту
    const favorite = req.query.favorite;

    // Перевірка, чи передане значення поля favorite є дійсним
    if (
      favorite !== undefined &&
      !["true", "false"].includes(favorite.toLowerCase())
    ) {
      return res
        .status(400)
        .json({ message: "Invalid value for favorite field" });
    }

    // Додавання умови до фільтру, якщо передане значення favorite є дійсним
    if (favorite !== undefined) {
      filter.favorite = favorite.toLowerCase() === "true";
    }

    // зсув для початку отримання контактів з правильної позиції (у MongoDB перша сторінка має індекс 0 )
    const skip = (page - 1) * limit;

    // передамо в параметри метода об'єкт - фільтр
    const contacts = await Contact.find(filter)
      // додамо до запиту к БД методи пагінації MongoDB
      .skip(skip)
      .limit(limit);
    return res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /api/contacts/:id
export const getOneContact = async (req, res, next) => {
  const { id } = req.params; // Отримуємо id з URL;

  try {
    //перевірка id на належність до ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw HttpError(400, "Invalid ObjectId format");
    }
    const contact = await Contact.findById(id);
    if (!contact) {
      throw HttpError(404);
    }
    // перевірка належності контакта користувачу
    if (contact.owner.toString() !== req.user.id) {
      throw HttpError(403, "Contact not found");
    }

    res.status(200).json(contact);
  } catch (error) {
    const status = error.status || 500; // обробка error як що статус відсутний
    res.status(status).json({ message: error.message });
  }
};

// DELETE /api/contacts/:id
export const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    //перевірка id на належність до ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw HttpError(400, "Invalid ObjectId format");
    }
    // пошук контакту за його ідентифікатором
    const contact = await Contact.findById(id);
    if (!contact) {
      throw HttpError(404);
    }
    // перевірка належності контакта користувачу
    if (contact.owner.toString() !== req.user.id) {
      throw HttpError(403, "Contact not found");
    }
    // пошук та видалення котакту
    const removedContact = await Contact.findByIdAndDelete(id);
    if (!removedContact) {
      throw HttpError(404);
    }
    res.status(200).json(removedContact);
  } catch (error) {
    next(error);
  }
};

// POST /api/contacts
export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { error } = createContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400);
    }
    console.log(req.user);
    // створюємо новий контакт
    const newContact = new Contact({
      name,
      email,
      phone,
      owner: req.user.id, // add owner з моделі Contact та присвоєння їй id користувача
    });

    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    next(error);
  }
};

// PUT /api/contacts/:id
export const updateContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    //перевірка id на належність до ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw HttpError(400, "Invalid ObjectId format");
    }
    const { name, email, phone } = req.body;
    const { error } = updateContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "Body must have at least one field");
    }
    // пошук контакту за його ідентифікатором
    const contact = await Contact.findById(id);
    if (!contact) {
      throw HttpError(404);
    }
    // перевірка належності контакта користувачу
    if (contact.owner.toString() !== req.user.id) {
      throw HttpError(403, "Contact not found");
    }
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
      },

      // За замовчуванням { new: false }, оновлення документу у MongoDB методом findByIdAndUpdate, повертає оригінал документа (до оновлення) якщо передати третім аргументом об'єкт { new: true }, метод поверне одразу оновленну версію документа.
      { new: true }
    );
    if (!updatedContact) {
      throw HttpError(404);
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

// ф-ція updateStatusContact
async function updateStatusContact(contactId, favorite) {
  try {
    // Оновлюємо поле favorite контакту за його ідентифікатором
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );
    // Перевіряємо, чи знайдено контакт за вказаним ID
    if (!updatedContact) {
      return null;
    }
    // Повертаємо оновлений контакт
    return updatedContact;
  } catch (error) {
    next(error);
  }
}

// PATCH /api/contacts/:contactId/favorite
export const updateContactFavoriteStatus = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  // Перевірка body запиту
  const { error } = validateFavoriteBody.validate(req.body);

  // Якщо тіло запиту не відповідає схемі, повертаємо помилку 400 (Bad Request)
  if (error) {
    // details[0].message - перша помилка при перевірці тіла запиту
    return res.status(400).json({ message: error.details[0].message });
  }

  // Якщо з body все добре, виклик ф-ції updateStatusContact (contactId, body)
  try {
    // пошук контакту за його ідентифікатором
    const contact = await Contact.findById(contactId);
    // console.log(contact);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // перевірка належності контакта користувачу
    if (contact.owner.toString() !== req.user.id) {
      throw HttpError(403, "Contact not found");
    }

    //перевірка contactId на належність до ObjectId
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }
    const updatedContact = await updateStatusContact(contactId, favorite);
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
  updateContactFavoriteStatus,
};