import express from "express";
import authentificationRouter from "./authentication/index.js";
import postsRouter from "./posts/index.js";
import usersRouter from "./users/index.js";
import guessesRouter from "./guesses/index.js";
import teamsRouter from "./teams/index.js";
import zonesRouter from "./zones/index.js";
import scoresRouter from "./scores/index.js";

// Ici, on importe les routes de chaque module et on les assembles
// dans le routeur principal. Celui-ci sera utilisé ensuite dans le fichier app.js.

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/api-docs");
});

router.use("/authentification", authentificationRouter);
router.use("/posts", postsRouter);
router.use("/users", usersRouter);
router.use("/guesses", guessesRouter);
router.use("/teams", teamsRouter);
router.use("/zones", zonesRouter);
router.use("/user-scores", scoresRouter);

export default router;
