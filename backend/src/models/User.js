import mongoose from "mongoose";

// définition du schéma pour les utilisateurs
const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            unique: [true, "pseudo must be unique"],
            minLength: [6, "pseudo must be at least 6 characters long"],
            maxLength: [10, "pseudo must be at most 10 characters long"],
            match: [/^[a-z]+$/, "pseudo must be in lowercases and not contain special characters"],
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
            type: String,
            enum: ["red", "blue"],
            required: true
        }
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
