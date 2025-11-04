import mongoose from "mongoose";

// définition du schéma pour les utilisateurs
const userSchema = new mongoose.Schema(
  {
    pseudo: {type : String, unique: true, required: true},
    email: {type : String, unique: true, required: true},
    password_hash: { type: String, required: true },
    is_admin: {type: Boolean, default: false},
  },
  {
    timestamps: true,
  }
);

// à partir du schéma, on crée le modèle Mongoose
const User = mongoose.model("User", userSchema);
export default User;
