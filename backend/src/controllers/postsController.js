import Post from "../models/Post.js";

export const getPosts = async (req, res) => {
  // pagination
  const limit = req.query.limit ?? 40;
  const skip = req.query.skip ?? 0;

  // filters
  const isValidatedFilter = req.query.isValidated;

  const findOptions = {};
  if (isValidatedFilter !== undefined) {
    findOptions.isValidated = isValidatedFilter;
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

  // TODO: Change this once authentication is implemented
  const userId = undefined;

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

  // TODO: Only allow admins to change isValidated
  post.isValidated = req.body.isValidated ?? post.isValidated;

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
