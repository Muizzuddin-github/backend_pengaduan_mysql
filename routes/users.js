import express from 'express'
import UsersControl from '../controllers/UsersControl.js'

const users = express.Router()


users.get("/",UsersControl.getAll)
users.post("/",UsersControl.post)

export default users