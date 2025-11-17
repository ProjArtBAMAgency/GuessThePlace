import express from "express";
import login from "../../controllers/authenticationController.js";


router.get("/", login);

export default router;
