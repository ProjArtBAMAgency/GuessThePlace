import User from "../models/User.js";
import Team from "../models/Teams.js";
import bcrypt from 'bcrypt';

const costFactor = 10;

export const createUser = async (req, res, next) => {
    try {
        const { pseudo, email, password_hash : password, team_id } = req.body;
        const password_hash = await bcrypt.hash(password, costFactor);

        const team = await Team.findById(team_id);
        const is_admin = false;
        
        if (!team) {
            res.status(400).send("Invalid team ID");
            return;
        }
        const user = new User({ pseudo, email, password_hash, is_admin, team_id: team._id });
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

export const getUsersByTeamId = async (req, res, next) => {
  try {
    const users = await User.find({ team: req.params.team_id });
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