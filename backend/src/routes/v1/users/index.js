import express from "express";
import { createUser, getUser, getUsers, getUsersByTeamId, patchUser, deleteUser } from "../../../controllers/usersController.js";
import { getUserPosts } from "../../../controllers/postsController.js";
import isAdmin from "../../../middlewares/admin.js"
import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

// Routes publiques
router.post("/", createUser);

// Routes spécifiques à l'utilisateur connecté
router.get("/teams/:team_id", isAuthenticated, getUsersByTeamId);

// Routes avec paramètres dynamiques 
router.get("/", isAuthenticated, getUsers);
router.get("/:id", isAuthenticated, getUser);
router.get("/:id/posts", isAuthenticated, getUserPosts);
router.patch("/:id", isAuthenticated, isAdmin, patchUser);
router.delete("/:id", isAuthenticated, isAdmin, deleteUser);

export default router;