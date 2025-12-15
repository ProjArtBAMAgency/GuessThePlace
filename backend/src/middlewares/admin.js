import User from "../models/User.js";

export default async function isAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.sub) {
      return res.sendStatus(401);
    }

    const userId = req.user.sub;
    const user = await User.findById(userId);

    if (user && user.is_admin === true) {
      return next();
    }

    return res.sendStatus(403);
  } catch (err) {
    return res.sendStatus(500);
  }
}