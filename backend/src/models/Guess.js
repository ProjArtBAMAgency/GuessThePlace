import mongoose from "mongoose";

const guessSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

const Guess = mongoose.model("Guess", guessSchema);
export default Guess;
