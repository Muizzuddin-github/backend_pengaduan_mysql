import express from "express";
import Gambar from "../controllers/Gambar.js";
import PenangananControl from "../controllers/PenangananControl.js";

const publicAccess = express.Router();

publicAccess.get("/image/:img", Gambar.getSingle);
publicAccess.get("/penanganan", PenangananControl.getAll);

export default publicAccess;
