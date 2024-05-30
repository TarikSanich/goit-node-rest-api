import Jimp from "jimp";
import { promises as fs } from "fs";
import User from "../models/User.js";
import path from "path";
import { error, log } from "console";
import sendVerificationEmail from "../services/mail.js";

const avatarsDir = path.resolve("public", "avatars");

const updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user === null) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatarURL === null) {
      return res.status(404).send({ message: "Avatar not found" });
    }

    const { path: tempUpload, originalname } = req.file;

    const ext = path.extname(originalname); 
    const name = path.basename(originalname, ext); 
    const newFilename = `${req.user.id}_${name}${ext}`; 
    const resultUpload = path.resolve(avatarsDir, newFilename); 

    await Jimp.read(tempUpload)
      .then((image) => image.resize(250, 250).write(resultUpload))
      .catch((err) => {
        next(error);
      });

    await fs.unlink(tempUpload);

    const avatarURL = `/avatars/${newFilename}`;
    user.avatarURL = avatarURL;
    await user.save();

    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};


const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOneAndUpdate(
      { verificationToken },
      { verify: true, verificationToken: " " }
    );

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    await user.save();

    res.status(200).send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "missing required field email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.verify === true) {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }

    await sendVerificationEmail(user.email, user.verificationToken);

    res.status(200).send({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

export default { updateAvatar, verify, resendVerificationEmail };