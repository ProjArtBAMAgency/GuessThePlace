import User from "../models/User.js";

export default async function isAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    if (req.user.is_admin === true) {
      return next();
    }

    return res.sendStatus(403);
  } catch (err) {
    return res.sendStatus(500);
  }
}