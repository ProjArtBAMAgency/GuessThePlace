import express from "express";
import { createUser, getUser, getUsers, getUsersByTeam, patchUser, deleteUser } from "../../../controllers/usersController.js";
import { getUserPosts } from "../../../controllers/postsController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/:id", getUser);
router.get("/", getUsers);
router.get("/teams/:team", getUsersByTeam);
router.get("/:id/posts", getUserPosts);
router.patch("/:id", patchUser);
router.delete("/:id", deleteUser);

export default router;