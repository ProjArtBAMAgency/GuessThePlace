import mongoose from "mongoose";


const zoneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: [true, "zone name must be unique"],
            required: [true, "zone name is required"]
        },
        zone: {
            type: Object,
    })