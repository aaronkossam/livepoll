import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };
    console.log(
      "Connecting to MongoDB with URI:",
      MONGODB_URI.replace(/:([^:@]+)@/, ":<password>@")
    );
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(
      (mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      },
      (error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      }
    );
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
