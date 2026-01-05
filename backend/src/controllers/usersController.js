// implémentation du controller usersController.js
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
        res.status(201).json({ message: "User created successfully.", user });
    }
    catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({message: "User retrieved successfully.", user});
    }
    catch (error) {
        next(error);
    }
};


export const getUsers = async (req, res, next) => {
    try {
        const pagination = req.query.pagination === 'true';
        const teamId = req.query.teamId || null;

        if(teamId && pagination) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            
            const users = await User.find({ team_id: teamId }).skip(skip).limit(limit);
            res.status(200).json(users);
            return;
        }
        
        if (teamId) {
            const users = await User.find({ team_id: teamId });
            res.status(200).json(users);
            return;
        }
        if (pagination) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            
            const users = await User.find().skip(skip).limit(limit);
            res.status(200).json(users);
            return;
        }
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
            res.status(404).json({ message: "User not found" });
            return;
        }
        if(req.body.pseudo) {
            const existingUser = await User.findOne({ pseudo: req.body.pseudo });

            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(409).json({ message: 'Username is already taken' });
            }
            if (req.body.pseudo.length < 6 || req.body.pseudo.length > 10) {
                return res.status(400).json({ message: 'Username must be between 6 and 10 characters' });
            }
            user.pseudo = req.body.pseudo;
        }
        if(req.body.email) {
            const existingEmail = await User.findOne({ email: req.body.email });
            
            if (existingEmail && existingEmail._id.toString() !== user._id.toString()) {
                return res.status(409).json({ message: 'Email is already in use' });
            }
            if (!/\S+@\S+\.\S+/.test(req.body.email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            user.email = req.body.email;
        }
        if(req.body.team_id) {
            const team = await Team.findById(req.body.team_id);
            if (!team) {
                return res.status(400).json({ message: 'Invalid team ID' });
            }
            user.team_id = req.body.team_id;
        }
         if(req.body.password) {
            const costFactor = 10;
            user.password_hash = await bcrypt.hash(req.body.password, costFactor);
        }
        await user.save();

        res.status(200).json({ message: "User updated successfully.", user });
    
    }
    catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(204).json({ message: "User deleted successfully." });
    }
    catch (error) {
        next(error);
    }
};