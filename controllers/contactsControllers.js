import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  validateFavoriteBody,
} from "../schemas/contactsSchemas.js";
import Contact from "../models/Contact.js";

import mongoose from "mongoose";


export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    return res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  const { id } = req.params; 

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw HttpError(400, "Invalid ObjectId format");
    }
    const contact = await Contact.findById(id);
    if (!contact) {
      throw HttpError(404);
    }
    res.status(200).json(contact);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

export const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  try {
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


export const updateContact = async (req, res, next) => {
  const { id } = req.params;
  try {
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
      { name, email, phone },
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



export const updateContactFavoriteStatus = async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;

  try {
    if (favorite === undefined || typeof favorite !== 'boolean') {
      return res.status(400).json({ message: "Body must contain 'favorite' field with a boolean value" });
    }
    

   
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { favorite },
      { new: true }
    );
    

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

