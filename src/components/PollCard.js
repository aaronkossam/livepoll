"use client";

import { Users } from "lucide-react";

export default function PollCard({ poll, handleVote }) {
  // ✅ Guard against missing poll data
  if (!poll || !poll.counts || !poll.options) {
    return (
      <div className="p-6 bg-gray-50 rounded-2xl text-gray-500 text-center">
        Loading poll...
      </div>
    );
  }

  const maxVotes = Math.max(...poll.counts, 1);
  const hasVoted = handleVote
    ? typeof window !== "undefined" && localStorage.getItem(`vote_${poll._id}`)
    : false;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex-1">
          {poll.question}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          <Users className="w-4 h-4" />
          <span className="font-medium">{poll.totalVotes ?? 0}</span>
        </div>
      </div>

      <div className="space-y-3">
        {poll.options.map((option, idx) => {
          const votes = poll.counts[idx] ?? 0;
          const percentage =
            poll.totalVotes > 0 ? (votes / poll.totalVotes) * 100 : 0;
          const isLeading = votes === maxVotes && votes > 0;

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  {handleVote && (
                    <button
                      onClick={() => handleVote(poll._id, idx)}
                      disabled={hasVoted}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        hasVoted
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
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

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Created{" "}
          {poll.createdAt
            ? `${new Date(poll.createdAt).toLocaleDateString()} at ${new Date(
                poll.createdAt
              ).toLocaleTimeString()}`
            : "N/A"}
        </p>
      </div>
    </div>
  );
}
