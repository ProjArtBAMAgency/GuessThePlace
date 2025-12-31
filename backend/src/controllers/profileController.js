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
            user.email = req.body.email;
        }

        if (req.body.pseudo) {
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

export const deleteProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.sub);
        
        if (!user) {
            res.status(404).send();
            return;
        }
        await User.deleteOne({ _id: req.user.sub });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}