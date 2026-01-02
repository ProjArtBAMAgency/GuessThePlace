import mongoose, { Schema } from "mongoose";
import User from "./User.js";

const postSchema = new mongoose.Schema(
  {
    placeName: String,
    latitude: Number,
    longitude: Number,
    isValidated: Boolean,
    picture: Buffer,
    pictureContentType: String,
    pictureSize: Number,
    userId: { type: Schema.Types.ObjectId, ref: User },
  },
  {
    timestamps: true,
  }
);

postSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.picture;
    delete ret.pictureContentType;
    delete ret.pictureSize;
    return ret;
  },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
