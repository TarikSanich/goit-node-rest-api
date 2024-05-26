import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";


const tmpDir = path.resolve("tmp"); 


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString("hex");
    cb(null, `${name}${ext}`);
  },
});


export default multer({ storage });