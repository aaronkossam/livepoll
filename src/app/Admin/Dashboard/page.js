"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
let socket;

export default function AdminDashboard() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [polls, setPolls] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchPolls();
    socket = io(SOCKET_URL);
    socket.on("connect", () => {});
    socket.on("newPoll", ({ poll }) => {
      setPolls((prev) => [poll, ...prev]);
    });
    socket.on("voteUpdate", ({ pollId, counts }) => {
      setPolls((prev) =>
        prev.map((p) => (p._id === pollId ? { ...p, counts } : p))
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  async function fetchPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    if (data.polls) {
      // optionally add counts
      const withCounts = data.polls.map((p) => {
        const counts = p.options.map(
          (_, i) => (p.votes || []).filter((v) => v.optionIndex === i).length
        );
        return { ...p, counts };
      });
      setPolls(withCounts);
    }
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function setOption(i, v) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const cleanOptions = options.map((s) => s.trim()).filter(Boolean);
    if (!question.trim() || cleanOptions.length < 2) {
      setMsg("Provide question and at least 2 options");
      return;
    }
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options: cleanOptions }),
    });
    const data = await res.json();
    if (res.ok) {
      setQuestion("");
      setOptions(["", ""]);
      setMsg("Poll created");
      // socket server will broadcast 'newPoll' and our socket client will pick it up
    } else {
      setMsg(data.error || "Failed");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Dashboard — Create Poll</h1>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="border p-2"
        />
        {options.map((opt, i) => (
          <input
            key={i}
            value={opt}
            onChange={(e) => setOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="border p-2"
          />
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addOption}
            className="px-3 py-1 border"
          >
            Add Option
          </button>
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white">
            Create Poll
          </button>
        </div>
        {msg && <p>{msg}</p>}
      </form>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Existing Polls</h2>
        {polls.map((p) => (
          <div key={p._id} className="mt-4 border p-3">
            <h3 className="font-bold">{p.question}</h3>
            <ul className="mt-2">
              {p.options.map((o, idx) => (
                <li key={idx}>
                  {o} — {p.counts ? p.counts[idx] : 0}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
