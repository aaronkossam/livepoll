const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow Next.js frontend
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/poll-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Poll Schema
const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  counts: [{ type: Number, default: 0 }],
  totalVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Poll = mongoose.model("Poll", pollSchema);

// API Routes
app.get("/api/polls", async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/polls", async (req, res) => {
  const { question, options } = req.body;
  if (!question || !options || options.length < 2) {
    return res
      .status(400)
      .json({ error: "Question and at least 2 options required" });
  }
  const poll = new Poll({
    question,
    options,
    counts: new Array(options.length).fill(0),
    totalVotes: 0,
  });
  try {
    const savedPoll = await poll.save();
    io.emit("pollCreated", savedPoll);
    res.status(201).json(savedPoll);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/polls/:id/vote", async (req, res) => {
  const { optionIndex } = req.body;
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll || optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: "Invalid poll or option" });
    }
    poll.counts[optionIndex] += 1;
    poll.totalVotes += 1;
    await poll.save();
    io.emit("voteUpdate", poll);
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
