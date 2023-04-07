import express from 'express'
import PengaduanControl from '../controllers/PengaduanControl.js'

const pengaduan = express.Router()

pengaduan.get("/",PengaduanControl.getAll)
pengaduan.get("/:id",PengaduanControl.getByid)
pengaduan.post("/",PengaduanControl.post)
pengaduan.delete("/:id",PengaduanControl.del)

export default pengaduan