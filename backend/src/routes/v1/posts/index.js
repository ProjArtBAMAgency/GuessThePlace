import express from "express";
import multer from "multer";
import {
  getPosts,
  getPost,
  createPost,
  getPostPicture,
  updatePost,
  deletePost,
} from "../../../controllers/postsController.js";
import isAdmin from "../../../middlewares/admin.js";
import isAuthenticated from "../../../middlewares/authentication.js";

const router = express.Router();

// 16MB limit because MongoDB
const fileSizeLimit = 16 * 1024 * 1024;

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: fileSizeLimit,
  },
});

router.get("/", isAuthenticated, isAdmin, getPosts);
router.get("/:id", isAuthenticated, getPost);
router.post("/", isAuthenticated, upload.single("picture"), createPost);
router.get("/:id/picture", isAuthenticated, getPostPicture);
router.patch("/:id", isAuthenticated, updatePost);
router.delete("/:id", isAuthenticated, deletePost);

export default router;
