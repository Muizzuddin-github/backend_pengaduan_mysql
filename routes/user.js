import express from "express";
import PengaduanControl from "../controllers/PengaduanControl.js";
import onlyUser from "../middlewares/onlyUser.js";
import KrisarControl from "../controllers/KrisarControl.js";
import PenangananControl from "../controllers/PenangananControl.js";

// hanya role user
const user = express.Router();

// pengaduan
user.get("/pengaduan/:status", onlyUser, PengaduanControl.getAllByUser);
user.post("/pengaduan", onlyUser, PengaduanControl.post);

// kisar
user.get("/krisar", onlyUser, KrisarControl.getAllByUser);
user.post("/krisar", onlyUser, KrisarControl.post);
user.delete("/krisar/:id", onlyUser, KrisarControl.del);

// penanganan
user.get("/penanganan/:status", onlyUser, PenangananControl.getAllUser);

export default user;
