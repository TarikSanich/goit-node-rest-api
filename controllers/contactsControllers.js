import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  validateFavoriteBody,
} from "../schemas/contactsSchemas.js";
import Contact from "../models/Contact.js";

import mongoose from "mongoose";

// GET /api/contacts
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
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
    const newContact = new Contact({ name, email, phone });
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
    throw error;
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
    //перевірка contactId на належність до ObjectId
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw HttpError(400, "Invalid ObjectId format");
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

