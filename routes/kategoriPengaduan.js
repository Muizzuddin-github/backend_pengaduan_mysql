import express from 'express'
import KatPengaduanControl from '../controllers/KatPengaduanControl.js'

const katPengaduan = express.Router()


katPengaduan.get("/",KatPengaduanControl.getAll)
katPengaduan.post("/",KatPengaduanControl.post)

export default katPengaduan