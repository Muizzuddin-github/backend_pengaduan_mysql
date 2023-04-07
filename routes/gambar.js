import express from 'express'
import Gambar from '../controllers/Gambar.js'

const gambar = express.Router()

gambar.get("/:img",Gambar.getSingle)


export default gambar