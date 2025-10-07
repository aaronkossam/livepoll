"use client";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
let socket;

export default function UserDashboard() {
  const [polls, setPolls] = useState([]);
  const [voterEmail, setVoterEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPolls();
    socket = io(SOCKET_URL);
    socket.on("newPoll", ({ poll }) => {
      setPolls((prev) => [
        { ...poll, counts: poll.options.map(() => 0) },
        ...prev,
      ]);
    });
    socket.on("voteUpdate", ({ pollId, counts }) => {
      setPolls((prev) =>
        prev.map((p) => (p._id === pollId ? { ...p, counts } : p))
      );
    });
    return () => socket.disconnect();
  }, []);

  async function fetchPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    if (data.polls) {
      const withCounts = data.polls.map((p) => {
        const counts = p.options.map(
          (_, i) => (p.votes || []).filter((v) => v.optionIndex === i).length
        );
        return { ...p, counts };
      });
      setPolls(withCounts);
    }
  }

  async function vote(pollId, optionIndex) {
    setMessage("");
    if (!voterEmail || !/\S+@\S+\.\S+/.test(voterEmail)) {
      setMessage("Enter a valid email to vote");
      return;
    }
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voterEmail: voterEmail.toLowerCase(),
        optionIndex,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Vote recorded — thanks!");
      // UI updates will come via socket.io 'voteUpdate'
    } else {
      setMessage(data.error || "Vote failed");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Staff Polls</h1>
      <div className="mt-4">
        <label className="block">
          Your email (required to prevent duplicate votes)
        </label>
        <input
          className="border p-2 mt-1"
          value={voterEmail}
          onChange={(e) => setVoterEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </div>

      <div className="mt-6 space-y-4">
        {polls.map((p) => (
          <div key={p._id} className="border p-4">
            <h3 className="font-semibold">{p.question}</h3>
            <ul className="mt-2">
              {p.options.map((opt, i) => (
                <li key={i} className="flex justify-between items-center mt-2">
                  <span>{opt}</span>
                  <div className="flex items-center gap-2">
                    <span>{p.counts ? p.counts[i] : 0}</span>
                    <button
                      onClick={() => vote(p._id, i)}
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Vote
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
