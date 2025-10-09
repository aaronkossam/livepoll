"use client";
import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import PollCard from "@/components/PollCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
});

export default function StaffPage() {
  const [polls, setPolls] = useState([]);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/polls`)
      .then((response) => setPolls(response.data))
      .catch((err) => console.error("❌ Error fetching polls:", err))
      .finally(() => setLoading(false));

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
      showMsg("You’ve already voted on this poll!", "error");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/polls/${pollId}/vote`, { optionIndex });

      localStorage.setItem(`vote_${pollId}`, "true");
      showMsg("Vote submitted successfully 🎉", "success");
    } catch (err) {
      console.error("Vote error:", err);
      showMsg("Failed to submit vote. Please try again.", "error");
    }
  }

  function showMsg(text, type) {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Polls</h1>
              <p className="text-gray-600">
                Vote on active polls and see results update live
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {msg.text && (
          <div
            className={`p-4 rounded-xl mb-4 transition-all ${
              msg.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Polls Section */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <p className="text-gray-500 animate-pulse">Loading polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              No active polls yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => (
              <PollCard key={poll._id} poll={poll} handleVote={handleVote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
