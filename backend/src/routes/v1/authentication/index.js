import express from "express";
import { login, logout } from "../../../controllers/authenticationController.js";

router.post("/login", login);
router.post("/logout", logout);

export default router;
