// 

import mongoose from "mongoose";
// схема для збереження моделі колекції users у MongoDB
const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false } // відключення додавання параметру __v (версіонування)
);
// Створення моделі на основі схеми
const User = mongoose.model("User", userSchema);

export default User;