import User from "../models/User.js";

export default async function isAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.sendStatus(401).json({ message: "Authentication required" });
    }
    if (req.user.is_admin === true) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden: Admin privileges required" });
  } catch (err) {
    return res.sendStatus(500);
  }
}