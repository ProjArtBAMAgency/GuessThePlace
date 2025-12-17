// implémentation du controller usersController.js
import User from "../models/User.js";
import bcrypt from 'bcrypt';

const costFactor = 10;

export const createUser = async (req, res, next) => {
    try {
        const { pseudo, email, password_hash : password, is_admin, team } = req.body;
        const password_hash = await bcrypt.hash(password, costFactor);
        const user = new User({ pseudo, email, password_hash, is_admin, team });
        await user.save();
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).send();
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};


export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
}

export const getUsersByTeam = async (req, res, next) => {
  try {
    const users = await User.find({ team: req.params.team });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};


export const patchUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) {
            res.status(404).send();
            return;
        }
        res.status(200).json(user);
    
    }
    catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).send();
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};