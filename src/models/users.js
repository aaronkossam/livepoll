import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "staff"], // restrict to these two roles
    default: "staff",
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
