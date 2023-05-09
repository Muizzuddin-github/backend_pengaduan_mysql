import express from "express";
import Auth from "../controllers/Auth.js";
import KatControl from "../controllers/KatControl.js";
import onlyUsers from "../middlewares/onlyUsers.js";

// untuk kedua role (user dan admin)
const users = express.Router();

users.post("/login", Auth.login);
users.get("/kategori-pengaduan", onlyUsers, KatControl.getAll);
users.get("/refresh-access-token", Auth.refreshAccessToken);
users.get("/islogin", Auth.isLogin);

export default users;
