import express from "express";
import morgan from "morgan";
import cors from "cors";
import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/authRouter.js";
import mongoose from "mongoose";
// завантаження .env file into process.env
// зробити npm i dotenv, створити file *.env, імпортувати модуль dotenv
import "dotenv/config";

const app = express();
app.use(morgan("tiny"));
app.use(cors());
// для глобального перетворення результатів обробки методу send(), що надсилає відповідь у вигляді тексту або HTML в об'єкт JSON
app.use(express.json());


app.use("/api/contacts", contactsRouter);
app.use("/api/users", authRouter);

// middleware обробки запитів неіснуючих маршруту
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});
// middleware - обробник помилок
app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

// отримуєм connection string в Atlas>Database>Connect>Drivers за обраним драйвером:
// const uri = "mongodb+srv://<username>:<password>@cluster0.wrlinfw.mongodb.net/<database_name>?retryWrites=true&w=majority&appName=Cluster0";
// де треба змінити на дійсні значення <username>, <password>, <database_name>

// отримання значення URI бази даних з змінної середовища DB_URI, файлу .env
const DB_URI = process.env.DB_URI;

// Підключення до бази даних перед запуском сервера
mongoose
  .connect(DB_URI)
  .then(() => {
    console.info("Database connection successful");

    // встановимо змінну PORT на значення, що передане через змінну середовища process.env.PORT ( якщо вона є визначеною) або порт 3000.
    const PORT = process.env.PORT || 3000;

    // Старт сервера після успішного підключення до бази даних
    app.listen(PORT, () => {
      console.log(`Server is running. Use our API on port: ${PORT}`);
    });
  })
  .catch((error) => {
    // обробка помилки
    console.error("Database connection error:", error);
    // завершити процес
    process.exit(1);
  });