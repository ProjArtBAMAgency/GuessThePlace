// implémentation du controller usersController.js
import User from "../models/User.js";

export const createUser = async (req, res, next) => {
    try {
        const { pseudo, email, password_hash, is_admin } = req.body;
        const user = new User({ pseudo, email, password_hash, is_admin });
        await user.save();
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};