import User from "../models/User.js";
import bcrypt from 'bcrypt';


export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.sub).populate('team_id');

        if (!user) {
            res.status(404).send();
            return;
        }

        const userProfile = {
            email: user.email,
            pseudo: user.pseudo,
            is_admin: user.is_admin,
            team_id: user.team_id,
        };

        res.status(200).json(userProfile);
    }
    catch (error) {
        next(error);
    }
};

export const patchProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.sub);

        if (!user) {
            res.status(404).send();
            return;
        }

        // Mettre à jour les champs autorisés
        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email });

            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(409).json({ message: 'Email is already taken' });
            }

            if (!/\S+@\S+\.\S+/.test(req.body.email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            user.email = req.body.email;
        }

        if (req.body.pseudo) {
            const existingUser = await User.findOne({ pseudo: req.body.pseudo });

            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(409).json({ message: 'Username is already taken' });
            }
            if (req.body.pseudo.length < 6 || req.body.pseudo.length > 10) {
                return res.status(400).json({ message: 'Username must be between 6 and 10 characters' });
            }
            user.pseudo = req.body.pseudo;
        }

        if (req.body.password) {
            const costFactor = 10;
            user.password_hash = await bcrypt.hash(req.body.password, costFactor);
        }

        await user.save();

        const userProfile = {
            email: user.email,
            pseudo: user.pseudo,
            is_admin: user.is_admin,
            team: user.team_id,
        };

        res.status(200).json(userProfile);

    }
    catch (error) {
        next(error);
    }
}

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.sub);

        if (!user) {
            res.status(404).json({ message: "Cannot find user" });
            return;
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordMatch) {
            res.status(401).json({ message: "Current password is incorrect" });
            return;
        }

        if( newPassword.length < 6 || newPassword.length > 20) {
            res.status(400).json({ message: "New password must be between 6 and 20 characters" });
            return;
        }
        const costFactor = 10;
        user.password_hash = await bcrypt.hash(newPassword, costFactor);
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        next(error);
    }
}

export const deleteProfile = async (req, res, next) => {
    try {
        const password = req.body.password;
        const user = await User.findById(req.user.sub);

        if (!user) {
            res.status(404).json();
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            res.status(401).json({ message: "Password is incorrect" });
            return;
        }

        await User.deleteOne({ _id: req.user.sub });
        res.status(204).json({ message: "Account deleted successfully" });
    }
    catch (error) {
        next(error);
    }
}