import express from "express";
import authentificationRouter from "./authentification/index.js";
import postsRouter from "./posts/index.js";


// Ici, on importe les routes de chaque module et on les assembles 
// dans le routeur principal. Celui-ci sera utilisé ensuite dans le fichier app.js.


const router = express.Router();

router.use("/authentification", authentificationRouter);
router.use("/posts", postsRouter);

export default router;