import Jimp from "jimp";
import { promises as fs } from "fs";
import User from "../models/User.js";
import path from "path";
import { error, log } from "console";


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
    console.log("ext: " + ext); 

    const name = path.basename(originalname, ext);
    console.log("name: " + name); // user

    const newFilename = `${req.user.id}_${name}${ext}`;
    console.log("newFilename: " + newFilename); 
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

export default { updateAvatar };