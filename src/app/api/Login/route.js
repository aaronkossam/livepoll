import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const responseAdmin = await fetch(`${BACKEND_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "admin" }),
    });

    // For Staff login page
    const responseUser = await fetch(`${BACKEND_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "user" }),
    });

    const adminData = await responseAdmin.json().catch(() => null);
    const userData = await responseUser.json().catch(() => null);

    if (responseAdmin.ok) {
      return NextResponse.json(adminData, { status: responseAdmin.status });
    }
    if (responseUser.ok) {
      return NextResponse.json(userData, { status: responseUser.status });
    }

    return NextResponse.json(
      {
        error:
          (adminData && adminData.error) ||
          (userData && userData.error) ||
          "Login failed",
      },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
