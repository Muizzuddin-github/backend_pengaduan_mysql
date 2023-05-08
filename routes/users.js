import express from "express";
import UsersControl from "../controllers/UsersControl.js";
import Auth from "../controllers/Auth.js";

const users = express.Router();

users.get("/", UsersControl.getAll);
users.post("/", UsersControl.post);
users.post("/login", Auth.login);

export default users;
