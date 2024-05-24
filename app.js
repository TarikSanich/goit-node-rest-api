import express from "express";
import morgan from "morgan";
import cors from "cors";
import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/authRouter.js";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());


app.use("/api/contacts", contactsRouter);
app.use("/api/users", authRouter);


app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});


const DB_URI = process.env.DB_URI;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.info("Database connection successful");

    const PORT = process.env.PORT || 3000;

  
    app.listen(PORT, () => {
      console.log(`Server is running. Use our API on port: ${PORT}`);
    });
  })
  .catch((error) => {
  
    console.error("Database connection error:", error);
  
    process.exit(1);
  });