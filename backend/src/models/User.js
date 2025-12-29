import mongoose from "mongoose";
import { Schema } from "mongoose";
import Team from "./Team.js";

// définition du schéma pour les utilisateurs
const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            unique: [true, "pseudo must be unique"],
            minLength: [6, "pseudo must be at least 6 characters long"],
            maxLength: [10, "pseudo must be at most 10 characters long"],
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^A-Za-z0-9]{8,}$/,
                "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
            ],
            required: [true, "pseudo is required"]
        },
        email: {
            type: String,
            unique: true,
            required: true,
            match: [/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/, "invalid email address"]
        },
        password_hash: { type: String, required: true },
        is_admin: { type: Boolean, default: false },
        team: {
            type: Schema.Types.ObjectId, ref: Team
        },

    },
    {
        timestamps: true,
    }
);

userSchema.set("toJSON", {
    transform: transformJsonUser
});

function transformJsonUser(doc, json, options) {
    // Remove the hashed password from the generated JSON.
    delete json.password;
    return json;
}

// à partir du schéma, on crée le modèle Mongoose
const User = mongoose.model("User", userSchema);
export default User;
