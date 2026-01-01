import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || "changeme";

const cookieExpiration = 60 * 60 * 1000; // 1 hour in milliseconds

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User
            .findOne({ email: email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const token = jwt.sign({ sub: user._id, is_admin: user.is_admin }, secretKey, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: cookieExpiration, 
        })
            .status(200)
            .json({ message: 'Login successful', cookieExpiration: cookieExpiration, pseudo: user.pseudo  });
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
