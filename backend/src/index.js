const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    // 16MB limit because MongoDB
    fileSize: 16 * 1024 * 1024,
  },
});

const postSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
    isValidated: Boolean,
    picture: Buffer,
    pictureContentType: String,
    pictureSize: Number,
  },
  {
    timestamps: true,
  }
);

postSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.picture;
    delete ret.pictureContentType;
    delete ret.pictureSize;
    return ret;
  },
});

const Post = mongoose.model("Post", postSchema);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/posts", async (req, res) => {
  // pagination
  const limit = req.query.limit ?? 40;
  const skip = req.query.skip ?? 0;

  // filters
  const isValidatedFilter = req.query.isValidated;

  const posts = await Post.find({
    isValidated: isValidatedFilter,
  })
    .sort({ createdAt: "asc" })
    .limit(limit)
    .skip(skip);

  res.json(posts);
});

app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  res.json(post);
});

app.get("/users/:id/posts", (req, res) => {});

app.post("/posts", upload.single("picture"), async (req, res) => {
  const post = new Post({
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    isValidated: false,
    picture: req.file.buffer,
    pictureContentType: req.file.mimetype,
    pictureSize: req.file.size,
  });

  await post.save();

  res.status(201);
  res.json(post);
});

app.get("/posts/:id/picture", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  res.set("Content-Type", post.pictureContentType);
  res.set("Content-Length", post.pictureSize);
  res.send(post.picture);
});

app.patch("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  post.latitude = req.body.latitude ?? post.latitude;
  post.longitude = req.body.longitude ?? post.longitude;

  await post.save();

  res.json(post);
});

app.delete("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  await post.remove();

  res.status(204);
  res.send();
});

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
