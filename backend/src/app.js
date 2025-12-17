import express from "express";
import "dotenv/config";
import createError from "http-errors";
import logger from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";

import { connectDB } from "./db.js";
import v1Router from "./routes/v1/index.js";
import cookieParser from "cookie-parser";

await connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, "..", "..", "frontend", "dist");

// Parse the OpenAPI document.
const openApiDocument = yaml.load(fs.readFileSync("./openapi.yml", "utf8"));
// Serve the Swagger UI documentation.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticDir));
app.use(cookieParser());

app.use("/api/v1", v1Router);

app.get("/", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

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
