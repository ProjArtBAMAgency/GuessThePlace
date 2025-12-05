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
import auth from "../../../middlewares/authentication.js";

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

router.get("/", [auth], getPosts);
router.get("/:id", [auth], getPost);
router.post("/", [auth], upload.single("picture"), createPost);
router.get("/:id/picture", [auth], getPostPicture);
router.patch("/:id", [auth], updatePost);
router.delete("/:id", [auth], deletePost);

export default router;
