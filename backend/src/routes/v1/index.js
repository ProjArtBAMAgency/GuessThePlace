import express from "express";
import authentificationRouter from "./authentification/index.js";
import postsRouter from "./posts/index.js";
import usersRouter from "./users/index.js";
import guessRouter from "./guess/index.js";

// Ici, on importe les routes de chaque module et on les assembles 
// dans le routeur principal. Celui-ci sera utilisé ensuite dans le fichier app.js.

const router = express.Router();

router.use("/authentification", authentificationRouter);
router.use("/posts", postsRouter);
router.use("/users", usersRouter);
router.use("/guess", guessRouter);

export default router;