import mongoose from "mongoose";

export async function connectDB(){
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_URI manquant dans .env");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connecté !");
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB :", err);
    process.exit(1);
  }
}