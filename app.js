import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import admin from "./routes/admin.js";
import users from "./routes/users.js";
import user from "./routes/user.js";
import publicAccess from "./routes/publicAccess.js";
dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan("tiny"));

app.use("/admin", admin);
app.use("/user", user);
app.use("/public", publicAccess);
app.use("/users", users);

app.listen(8080, function () {
  console.log("server is listening");
});
