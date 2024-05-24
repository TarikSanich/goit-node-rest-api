import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  validateFavoriteBody,
} from "../schemas/contactsSchemas.js";
import Contact from "../models/Contact.js";
import mongoose from "mongoose";

// Отримати всі контакти
export const getAllContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const userId = req.user.id;
    const filter = { owner: userId };

    const favorite = req.query.favorite;

    if (favorite !== undefined && !["true", "false"].includes(favorite.toLowerCase())) {
      return res.status(400).json({ message: "Invalid value for favorite field" });
    }

    if (favorite !== undefined) {
      filter.favorite = favorite.toLowerCase() === "true";
    }

    const skip = (page - 1) * limit;
    const contacts = await Contact.find(filter).skip(skip).limit(limit);
    return res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Отримати один контакт за id та owner
export const getOneContact = async (req, res, next) => {
  const { id } = req.params; 
  const owner = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw HttpError(400, "Invalid ObjectId format");
    }
    const contact = await Contact.findOne({ _id: id, owner });
    if (!contact) {
      throw HttpError(404, "Contact not found");
    }
    res.status(200).json(contact);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

// Видалити контакт за id та owner
export const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  const owner = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw HttpError(400, "Invalid ObjectId format");
    }
    const contact = await Contact.findOne({ _id: id, owner });
    if (!contact) {
      throw HttpError(404, "Contact not found");
    }
    const removedContact = await Contact.findOneAndDelete({ _id: id, owner });
    res.status(200).json(removedContact);
  } catch (error) {
    next(error);
  }
};

// Створити новий контакт
export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { error } = createContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400);
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      owner: req.user.id, 
    });

    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    next(error);
  }
};

// Оновити контакт за id та owner
export const updateContact = async (req, res, next) => {
  const { id } = req.params;
  const owner = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw HttpError(400, "Invalid ObjectId format");
    }
    const { name, email, phone } = req.body;
    const { error } = updateContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "Body must have at least one field");
    }
    
    const contact = await Contact.findOne({ _id: id, owner });
    if (!contact) {
      throw HttpError(404, "Contact not found");
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, owner },
      { name, email, phone },
      { new: true }
    );

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

// Оновити статус контакту за id та owner
export const updateContactFavoriteStatus = async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;
  const owner = req.user.id;

  const { error } = validateFavoriteBody.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    const contact = await Contact.findOne({ _id: id, owner });
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, owner },
      { favorite },
      { new: true }
    );

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
  updateContactFavoriteStatus,
};
