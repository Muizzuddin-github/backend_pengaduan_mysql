import express from "express";
import Auth from "../controllers/Auth.js";
import KatControl from "../controllers/KatControl.js";
import onlyUsers from "../middlewares/onlyUsers.js";
import UsersControl from "../controllers/UserControl.js";

// untuk kedua role (user dan admin)
const users = express.Router();

users.post("/login", Auth.login);
users.get("/kategori-pengaduan", onlyUsers, KatControl.getAll);
users.put("/logout", Auth.logout);
users.post("/register", UsersControl.post);
users.get("/islogin", Auth.isLogin);

export default users;
