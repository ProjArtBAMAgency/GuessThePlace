import express from "express";
import { createUser, getUser, getUsers, getUsersByTeam, patchUser, deleteUser } from "../../../controllers/usersController.js";
import { getUserPosts } from "../../../controllers/postsController.js";
import  isAdmin  from "../../../middlewares/admin.js"
import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

router.post("/",  createUser);
router.get("/:id", isAuthenticated, isAdmin, getUser);
router.get("/", getUsers);
router.get("/teams/:team", getUsersByTeam);
router.get("/:id/posts", getUserPosts);
router.patch("/:id", patchUser);
router.delete("/:id", deleteUser);

export default router;