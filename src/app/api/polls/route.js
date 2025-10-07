// app/api/polls/[id]/vote/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Poll from "@/models/polls";
import { io as clientIo } from "socket.io-client";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:4000";

export async function POST(req, { params }) {
  try {
    const pollId = params.id;
    const { voterEmail, optionIndex } = await req.json();

    if (!voterEmail || typeof optionIndex !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();
    const poll = await Poll.findById(pollId);
    if (!poll)
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });

    // Prevent multiple voting: check if this voterEmail already voted on this poll
    const already = poll.votes.find(
      (v) => v.voterEmail.toLowerCase() === voterEmail.toLowerCase()
    );
    if (already) {
      return NextResponse.json(
        { error: "You have already voted on this poll" },
        { status: 403 }
      );
    }

    // Save vote
    poll.votes.push({ voterEmail: voterEmail.toLowerCase(), optionIndex });
    await poll.save();

    // Prepare updated tally
    const counts = poll.options.map(
      (_, i) => poll.votes.filter((v) => v.optionIndex === i).length
    );

    // Emit vote update to socket server
    const socket = clientIo(SOCKET_URL);
    socket.emit("voteUpdate", { pollId, counts });
    socket.disconnect();

    return NextResponse.json({ success: true, counts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
