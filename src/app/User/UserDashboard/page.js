"use client";
import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import PollCard from "../../PollCard/page.js";

const socket = io("http://localhost:5000");

export default function StaffPage() {
  const [polls, setPolls] = useState([]);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    // Fetch polls
    axios
      .get("http://localhost:5000/api/polls")
      .then((response) => setPolls(response.data))
      .catch((err) => console.error("Error fetching polls:", err));

    // Socket.IO listeners
    socket.on("pollCreated", (newPoll) => {
      setPolls((prev) => [newPoll, ...prev]);
    });

    socket.on("voteUpdate", (updatedPoll) => {
      setPolls((prev) =>
        prev.map((poll) => (poll._id === updatedPoll._id ? updatedPoll : poll))
      );
    });

    return () => {
      socket.off("pollCreated");
      socket.off("voteUpdate");
    };
  }, []);

  async function handleVote(pollId, optionIndex) {
    if (localStorage.getItem(`vote_${pollId}`)) {
      setMsg({ text: "You have already voted on this poll!", type: "error" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/polls/${pollId}/vote`, {
        optionIndex,
      });
      localStorage.setItem(`vote_${pollId}`, "true");
      setMsg({ text: "Vote submitted successfully! 🎉", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      setMsg({ text: "Failed to submit vote", type: "error" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Polls</h1>
              <p className="text-gray-600">
                Vote on active polls and see real-time results
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {msg.text && (
            <div
              className={`p-4 rounded-xl ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          {polls.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                No active polls yet. Check back later!
              </p>
            </div>
          ) : (
            polls.map((poll) => (
              <PollCard key={poll._id} poll={poll} handleVote={handleVote} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
