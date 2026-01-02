import express from "express";
import { createUser, getUser, getUsers, getUsersByTeamId, patchUser, deleteUser } from "../../../controllers/usersController.js";
import { getUserPosts } from "../../../controllers/postsController.js";
import  isAdmin  from "../../../middlewares/admin.js"
import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

router.post("/",  createUser);
router.get("/:id", isAuthenticated, getUser);
router.get("/", isAuthenticated, getUsers);
router.get("/users/:team_id", isAuthenticated, getUsersByTeamId); 
router.get("/:id/posts", isAuthenticated, getUserPosts);
router.patch("/:id", isAuthenticated, isAdmin, patchUser);
router.delete("/:id", isAuthenticated, isAdmin, deleteUser);

export default router;