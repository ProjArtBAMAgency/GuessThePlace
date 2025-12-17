import express from "express";
import { createUser, getUser, getUsers, getUsersByTeam, patchUser, deleteUser } from "../../../controllers/usersController.js";
import { getUserPosts } from "../../../controllers/postsController.js";
import  isAdmin  from "../../../middlewares/admin.js"
import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

router.post("/",  createUser);
router.get("/:id", isAuthenticated, getUser);
router.get("/", isAuthenticated, getUsers);
router.get("/users/:team", isAuthenticated, getUsersByTeam); // TODO : chercher avec la team id 
router.get("/:id/posts", isAuthenticated, getUserPosts);
router.patch("/:id", isAuthenticated, patchUser);
router.delete("/:id", isAuthenticated, deleteUser);

export default router;