import Post from "../models/Post.js";
import User from "../models/User.js";

export const getPosts = async (req, res) => {
  // pagination
  const limit = req.query.limit ?? 40;
  const skip = req.query.skip ?? 0;

  // filters
  const isValidatedParam = req.query.isValidated;

  const findOptions = {};
  if (isValidatedParam !== undefined) {
    // Convert query param strings to booleans when appropriate
    if (isValidatedParam === "true" || isValidatedParam === true) {
      findOptions.isValidated = true;
    } else if (isValidatedParam === "false" || isValidatedParam === false) {
      findOptions.isValidated = false;
    } else {
      findOptions.isValidated = isValidatedParam;
    }
  } else {
    // No isValidated filter provided: only admins may list all posts
    // If request is unauthenticated, refuse instead of throwing.
    if (!req.user) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const user = await User.findById(req.user.sub);
    if (!user || user.is_admin !== true) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  }

  const posts = await Post.find(findOptions)
    .sort({ createdAt: "asc" })
    .limit(limit)
    .skip(skip);

  res.json(posts);
};

export const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  res.json(post);
};

export const getUserPosts = async (req, res) => {
  const userId = req.params.id;

  // pagination
  const limit = req.query.limit ?? 40;
  const skip = req.query.skip ?? 0;

  // filters
  const isValidatedFilter = req.query.isValidated;

  const findOptions = { user: userId };
  if (isValidatedFilter !== undefined) {
    findOptions.isValidated = isValidatedFilter;
  }

  const posts = await Post.find(findOptions)
    .sort({ createdAt: "asc" })
    .limit(limit)
    .skip(skip);

  res.json(posts);
};

export const createPost = async (req, res) => {
  // Validate that a file was uploaded
  if (!req.file) {
    res.status(400);
    res.json({
      error: "No picture uploaded.",
    });
    return;
  }

  const userId = req.user.sub;

  const post = new Post({
    placeName: req.body.placeName,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    isValidated: false,
    picture: req.file.buffer,
    pictureContentType: req.file.mimetype,
    pictureSize: req.file.size,
    userId,
  });

  await post.save();

  res.status(201);
  res.json(post);
};

export const getPostPicture = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  res.set("Content-Type", post.pictureContentType);
  res.set("Content-Length", post.pictureSize);
  res.send(post.picture);
};

export const updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  post.latitude = req.body.latitude ?? post.latitude;
  post.longitude = req.body.longitude ?? post.longitude;

  // Only allow admins to change isValidated
  if (req.body.isValidated !== undefined) {
    const user = await User.findById(req.user.sub);
    if (user && user.is_admin === true) {
      post.isValidated = req.body.isValidated;
    }
  }

  await post.save();

  res.json(post);
};

export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  await post.deleteOne();

  res.status(204);
  res.send();
};
