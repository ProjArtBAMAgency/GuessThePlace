import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "zone name must be unique"],
      required: [true, "zone name is required"],
    },
    zones: {
      type: [Number],
      required: true,
      validate: {
        validator: validateGeoJsonCoordinates,
        message:
          "{VALUE} is not a valid longitude/latitude(/altitude) coordinates array",
      },
    },
  },

  {
    timestamps: true,
  }
);

// Create a geospatial index on the location property.
zoneSchema.index({ location: '2dsphere' });

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
  return Array.isArray(value) && value.length >= 2 && value.length <= 3 && isLongitude(value[0]) && isLatitude(value[1]);
}

function isLatitude(value) {
  return value >= -90 && value <= 90;
}

function isLongitude(value) {
  return value >= -180 && value <= 180;
}



const Zone = mongoose.model("Zone", zoneSchema);
export default Zone;
