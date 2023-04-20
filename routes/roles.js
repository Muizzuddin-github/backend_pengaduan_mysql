import express from 'express'
import RolesControl from '../controllers/RolesControl.js'

const roles = express.Router()

roles.get("/",RolesControl.getAll)


export default  roles