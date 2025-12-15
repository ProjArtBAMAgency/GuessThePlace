import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const secretKey = "changeme";
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

// Return basic info about the authenticated user. Requires authenticateToken middleware.
export const me = async (req, res, next) => {
    try {
        // jwt middleware sets req.user to the decoded token payload (we used { sub: user._id })
        if (!req.user || !req.user.sub) {
            return res.sendStatus(401);
        }

        // Return the subject (user id) to the frontend. Frontend can then fetch user details if needed.
        res.json({ userId: req.user.sub });
    } catch (err) {
        next(err);
    }
};