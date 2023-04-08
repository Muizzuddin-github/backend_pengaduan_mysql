import express from 'express'
import KrisarControl from '../controllers/KrisarControl.js'

const krisar = express.Router()

krisar.get("/",KrisarControl.getAll)
krisar.post("/",KrisarControl.post)
krisar.delete("/:id",KrisarControl.del)

export default krisar