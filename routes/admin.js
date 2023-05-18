import express from "express";
import KatControl from "../controllers/KatControl.js";
import onlyAdmin from "../middlewares/onlyAdmin.js";
import PengaduanControl from "../controllers/PengaduanControl.js";
import KrisarControl from "../controllers/KrisarControl.js";

const admin = express.Router();

// kategori pengaduan
admin.post("/kategori-pengaduan", onlyAdmin, KatControl.post);
admin.put("/kategori-pengaduan/:id", onlyAdmin, KatControl.put);
admin.delete("/kategori-pengaduan/:id", onlyAdmin, KatControl.del);

// pengaduan
admin.get("/pengaduan/:status", onlyAdmin, PengaduanControl.getAll);
admin.patch("/pengaduan/:id", onlyAdmin, PengaduanControl.ubahStatus);

// kisar
admin.get("/krisar", onlyAdmin, KrisarControl.getAll);

export default admin;
