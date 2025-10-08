import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://livepoll-backend-ttuy.onrender.com"; // your Render backend

export async function POST(req, { params }) {
  try {
    const pollId = params.id;
    const body = await req.json();

    // Forward the vote request to your backend
    const response = await fetch(`${BACKEND_URL}/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("Vote proxy error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
