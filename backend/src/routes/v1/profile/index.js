import express from "express";
import { getProfile, getProfileStat, patchProfile, deleteProfile, changePassword, deletePostsByUser, getAvailablePosts} from "../../../controllers/profileController.js";
import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

// Routes spécifiques au profil de l'utilisateur connecté
// Ces routes sont montées sous /api/v1/profile

router.get("/me", isAuthenticated, getProfile);
router.patch("/me", isAuthenticated, patchProfile);
router.delete("/me", isAuthenticated, deleteProfile);
router.get("/me/available-posts", isAuthenticated, getAvailablePosts);
router.get("/me/statistics", isAuthenticated, getProfileStat);
router.patch("/me/change-password", isAuthenticated, changePassword);
router.delete("/me/posts/:postId", isAuthenticated, deletePostsByUser);

export default router;