"use client";
import { useState, useEffect } from "react";
import { BarChart3, Plus, Trash2, TrendingUp } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import PollCard from "@/components/PollCard";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"
);

export default function AdminDashboard() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [polls, setPolls] = useState([]);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    // Fetch polls
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/polls`)
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

  function addOption() {
    if (options.length < 6) {
      setOptions((prev) => [...prev, ""]);
    }
  }

  function removeOption(i) {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, idx) => idx !== i));
    }
  }

  function setOption(i, v) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    const cleanOptions = options.map((s) => s.trim()).filter(Boolean);
    if (!question.trim() || cleanOptions.length < 2) {
      setMsg({
        text: "Please provide a question and at least 2 options",
        type: "error",
      });
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/polls", {
        question: question.trim(),
        options: cleanOptions,
      });
      setQuestion("");
      setOptions(["", ""]);
      setMsg({ text: "Poll created successfully! 🎉", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      setMsg({ text: "Failed to create poll", type: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Poll Dashboard
              </h1>
              <p className="text-gray-600">
                Create and monitor live polls in real-time
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Create New Poll
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to ask?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={opt}
                        onChange={(e) => setOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="w-11 h-11 flex items-center justify-center border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={addOption}
                  disabled={options.length >= 6}
                  className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  + Add Option
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                >
                  Create Poll
                </button>
              </div>

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
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Active Polls</h2>
              <span className="ml-auto text-sm font-medium text-gray-500">
                {polls.length} poll{polls.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {polls.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    No polls yet. Create your first one!
                  </p>
                </div>
              ) : (
                polls.map((poll) => <PollCard key={poll._id} poll={poll} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
