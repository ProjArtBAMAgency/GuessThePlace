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

router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/users/:id/posts", (req, res) => {});
router.post("/", upload.single("picture"), createPost);
router.get("/:id/picture", getPostPicture);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
