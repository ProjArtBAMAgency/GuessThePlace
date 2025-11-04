import express from "express";
import createError from "http-errors";
import logger from "morgan";
import guessesRouter from "./routes/guesses.routes.js";

import v1Router from "./routes/v1/index.js";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", v1Router);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.get("/", (req, res) => res.send("API GuessThePlace"));
app.use("/api/v1/guesses", guessesRouter);


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
