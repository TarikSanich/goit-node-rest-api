import HttpError from "../helpers/HttpError.js";
import { registerUserSchema, loginUserSchema } from "../schemas/usersSchemas.js";
import gravatar from 'gravatar';
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export const registerUser = async (req, res, next) => {
  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.message });
  }

  try {
    const { email, password } = req.body;
    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(409).send({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
    });

    res.status(201).send({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { error } = loginUserSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.message });
  }

  try {
    const { email, password } = req.body;
    const existUser = await User.findOne({ email });

    if (!existUser) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const isMatch = await bcrypt.compare(password, existUser.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const payload = { id: existUser._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

    existUser.token = token;
    await existUser.save();

    res.status(200).send({
      token,
      user: {
        email: existUser.email,
        subscription: existUser.subscription,
        avatarURL: existUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).send({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).send({ message: "Not authorized" });
    }

    res.status(200).send({
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  const validSubscriptions = ["starter", "pro", "business"];
  const { subscription } = req.body;

  if (!validSubscriptions.includes(subscription)) {
    return res.status(400).json({ message: "Invalid subscription value" });
  }

  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.subscription = subscription;
    await user.save();

    res.status(200).json({
      message: "Subscription updated successfully",
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateSubscription,
};
