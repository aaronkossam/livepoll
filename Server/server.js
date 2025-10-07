const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");
const cors = require("cors");

// Detect environment
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now — restrict later if needed
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection (⚠️ use environment variable for security)
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/poll-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

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
  } catch {
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
  });
  try {
    const savedPoll = await poll.save();
    io.emit("pollCreated", savedPoll);
    res.status(201).json(savedPoll);
  } catch {
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
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Integrate Next.js frontend
nextApp.prepare().then(() => {
  app.all("*", (req, res) => handle(req, res));

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
});
