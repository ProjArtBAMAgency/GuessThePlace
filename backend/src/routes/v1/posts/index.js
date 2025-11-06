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

async function start() {
  await mongoose.connect("mongodb://localhost:27017/gtp");

  // routes for guesses
  const guessesRoutes = require("./routes/guesses.routes");
  app.use("/guesses", guessesRoutes);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

start();
