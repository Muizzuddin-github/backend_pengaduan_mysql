import express from "express";
import PengaduanControl from "../controllers/PengaduanControl.js";
import onlyUser from "../middlewares/onlyUser.js";
import UsersControl from "../controllers/UserControl.js";
import KrisarControl from "../controllers/KrisarControl.js";

// hanya role user
const user = express.Router();

// users

user.get("/", UsersControl.getAll);
user.post("/", UsersControl.post);

// pengaduan
user.get("/pengaduan/:status", onlyUser, PengaduanControl.getAllByUser);

// kisar

user.post("/krisar", onlyUser, KrisarControl.post);
user.delete("/krisar/:id", onlyUser, KrisarControl.del);

export default user;
