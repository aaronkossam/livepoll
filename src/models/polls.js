// models/Poll.js
import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  voterEmail: { type: String, required: true }, // identifier for vote uniqueness
  optionIndex: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  votes: [VoteSchema], // store votes
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Poll || mongoose.model("Poll", PollSchema);
