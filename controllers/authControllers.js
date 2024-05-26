import HttpError from "../helpers/HttpError.js";
import { registerUserSchema } from "../schemas/usersSchemas.js";
import gravatar from 'gravatar';
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerUser = async (req, res, next) => {
  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.message });
  }

  try {
    const existUser = await User.findOne({ email: req.body.email });

    if (existUser !== null) {
      return res.status(409).send({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const avatar = gravatar.url(email, { s: "250", d: "retro" }, true);


    await User.create({
      email: req.body.email,
      password: hashedPassword,
      avatarURL: avatar,
    });

    res.status(201).send({
      user: {
        email: req.body.email,
        subscription: "starter",
        avatarURL: avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.message });
  }
  try {
    const existUser = await User.findOne({ email: req.body.email });
    if (existUser === null) {
      console.log("Email is wrong");
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const isMatch = await bcrypt.compare(req.body.password, existUser.password);
    if (isMatch === false) {
      console.log("Password is wrong");
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    
    const payload = {
      id: existUser.id,
    };

    const secret = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secret, { expiresIn: "23h" });

    existUser.token = token;
    await existUser.save();

    res.status(200).send({
      token: token,
      user: {
        email: req.body.email,
        subscription: "starter",
      },
    });
    next();
  } catch (error) {
    next(error);
  }
};


export const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId);

    if (user === null) {
      return res.status(401).send({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    return res.status(204).send("No Content");
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId);

    if (user === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    const result = { email: user.email, subscription: user.subscription };
    return res.status(200).send(result);
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
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.subscription = subscription;
    await user.save();

    res
      .status(200)
      .json({
        message: "Subscription updated successfully",
        user: { email: user.email, subscription: user.subscription },
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