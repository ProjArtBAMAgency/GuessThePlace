import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
         name : {type : String, required : true},
         color : String,
}, {timestamps : true}
);

const Teams = mongoose.model("Teams", teamSchema);
export default Teams;