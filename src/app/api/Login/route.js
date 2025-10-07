import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import User from "@/models/users";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Ensure database connection
    await connectToDatabase();

    // Find user by email (always lowercase)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("No user found for email:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare hashed password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Redirect based on role
    const redirect = user.role === "admin" ? "/Admin/Dashboard" : "/Dashboard";

    return NextResponse.json({
      success: true,
      role: user.role,
      redirect,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
