const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 },
});

const userSchema = new mongoose.Schema(
  {
    pseudo: String,
    email: String,
    password_hash: String,
    is_admin: Boolean,
    team_id: String,
    created_at: Date,
    updated_at: Date,
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);

app.use(bodyParser.json());

app.get("/test", (req, res) => {
  res.send("coucou Mathilde");
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`Server on ${port}`));
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

start();
