"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const AdminSignin = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // router.push("/Dashboard"); // Adjust to your desired redirect
      window.location.href = "/Dashboard";
    } catch (error) {
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/Artboard 3.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="bg-cover bg-center h-screen "
    >
      <div className="pt-16 xl:pt-11 xl:justify-end justify-center grid xl:pr-14 2xl:pt-80 xl:grid ">
        {/* {container} */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-6xl 2xl:text-8xl font-black">HDEX INC</p>
          <span className="italic 2xl:text-5xl">Live Poll Portal</span>
        </motion.div>

        {/* Options (Staff/Admin) */}
        <motion.div
          className="flex gap-10 justify-center pt-3 pb-2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p className="grid gap-2 justify-center grid-cols-2 text-[20px]">
            Staff
            <div>
              <Link href="/">
                <Checkbox enabled />
              </Link>
            </div>
          </p>
          <p className="grid gap-2 grid-cols-2 text-[20px]">
            Admin
            <div>
              <Link href="/Admin/SigninForm">
                <Checkbox checkdefault />
              </Link>
            </div>
          </p>
        </motion.div>

        <div className=" pr-1 pl-1  ">
          <Card className="w-lvw xl:w-screen  xl:max-w-dvh 2xl:w-5xl 2xl:max-h-lvh  max-w-sm">
            <CardHeader>
              <CardTitle>Login to your Admin account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onClick={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      onChange={(e) => setEmail(e.target.value)}
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      onChange={(e) => setPassword(e.target.value)}
                      id="password"
                      type="password"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-3.5 w-full">
                  Login
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2"></CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSignin;
