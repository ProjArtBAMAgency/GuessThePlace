import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
    isValidated: Boolean,
    picture: Buffer,
    pictureContentType: String,
    pictureSize: Number,
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
