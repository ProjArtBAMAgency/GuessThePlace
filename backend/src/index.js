const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

const postSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
});

const Post = mongoose.model("Post", postSchema);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/posts", async (req, res) => {
  const posts = await Post.find();

  res.json(posts);
});

app.get("/posts/:id", (req, res) => {});

app.get("/users/:id/posts", (req, res) => {});

app.post("/posts", (req, res) => {
  const post = new Post({
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });

  post.save();

  res.status(201);
  res.json(post);
});

app.patch("/posts/:id", (req, res) => {});

app.delete("/posts/:id", (req, res) => {});

async function start() {
  await mongoose.connect("mongodb://localhost:27017/gtp");

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

start();
