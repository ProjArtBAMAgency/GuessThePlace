import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY;
const exp = Math.floor(Date.now() / 1000) + (60 * 60); //  une heure d'expiration


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User
            .findOne({ email: email });
        if (!user) {
            res.status(401).send("Mot de passe ou email invalide");
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            res.status(401).send("Mot de passe ou email invalide");
            return;
        }
        const token = jwt.sign({ sub: user._id }, secretKey, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: exp, 
        })
            .status(200)
            .json({ message: 'Login successful' });
    }
    catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    })
        .status(200)
        .json({ message: 'Logout successful' });
};          