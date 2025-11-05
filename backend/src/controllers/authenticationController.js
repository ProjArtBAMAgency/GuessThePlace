import bcrypt from 'bcrypt';
import User from '../models/User.js';


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User
            .findOne({ email: email });
        if (!user) {
            res.status(401).send("Invalid email or password");
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            res.status(401).send("Invalid email or password");
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};