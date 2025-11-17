import bcrypt from 'bcrypt';
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const secretKey = process.env.SECRET_KEY;
const exp = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour expiration


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
        const token = jwt.sign({ sub: user._id }, secretKey, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // le cookie expire 1 heure après avoir été créé
        })
            .status(200)
            .json({ message: 'Login successful' });
    }
    catch (error) {
        next(error);
    }
};