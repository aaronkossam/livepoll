"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function PollCard({ poll, handleVote }) {
  const [localPoll, setLocalPoll] = useState(poll);

  // ✅ Keep local state in sync if poll updates from socket or re-render
  useEffect(() => {
    setLocalPoll(poll);
  }, [poll]);

  // ✅ Guard against missing poll data
  if (
    !localPoll ||
    !Array.isArray(localPoll.options) ||
    !Array.isArray(localPoll.counts)
  ) {
    return (
      <div className="p-6 bg-gray-50 rounded-2xl text-gray-500 text-center">
        Loading poll...
      </div>
    );
  }

  const totalVotes =
    localPoll.totalVotes ??
    localPoll.counts.reduce((sum, n) => sum + (n || 0), 0);
  const maxVotes = Math.max(...localPoll.counts, 1);

  const hasVoted =
    handleVote &&
    typeof window !== "undefined" &&
    localStorage.getItem(`vote_${localPoll._id}`);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex-1">
          {localPoll.question}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          <Users className="w-4 h-4" />
          <span className="font-medium">{totalVotes}</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {localPoll.options.map((option, idx) => {
          const votes = localPoll.counts[idx] ?? 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          const isLeading = votes === maxVotes && votes > 0;

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Only show Vote button for staff or non-admin dashboards */}
                  {handleVote && (
                    <button
                      onClick={() => handleVote(localPoll._id, idx)}
                      disabled={hasVoted}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        hasVoted
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      Vote
                    </button>
                  )}
                  <span
                    className={`font-medium ${
                      isLeading ? "text-indigo-700" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </span>
                </div>

                <span
                  className={`font-bold ${
                    isLeading ? "text-indigo-600" : "text-gray-600"
                  }`}
                >
                  {votes} ({percentage.toFixed(1)}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                    isLeading
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "bg-gradient-to-r from-gray-300 to-gray-400"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
        Created{" "}
        {localPoll.createdAt
          ? `${new Date(
              localPoll.createdAt
            ).toLocaleDateString()} at ${new Date(
              localPoll.createdAt
            ).toLocaleTimeString()}`
          : "N/A"}
      </div>
    </div>
  );
}
