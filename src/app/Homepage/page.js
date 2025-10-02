"use client";
import React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import SigninForm from "./clientSignInForm/page";
import AdminSignin from "../Admin/SigninForm/page";
import Link from "next/link";
const Homepage = () => {
  return (
    <div
      style={{
        backgroundImage: 'url("/Artboard 3.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="bg-cover bg-center h-screen "
    >
      <div className="pt-16 xl:pt-0 xl:justify-end 2xl:pt-64 justify-center flex xl:pr-14 xl:grid  ">
        {/* {container} */}
        <div className="pt-16 ">
          {/* Title */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-6xl  2xl:text-8xl font-black">HDEX INC</p>
            <span className="italic 2xl:text-5xl">Live Poll Portal</span>
          </motion.div>

          {/* Options (Staff/Admin) */}
          <motion.div
            className="flex gap-10 justify-center pt-3 pb-2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="grid gap-2 grid-cols-2 text-[20px]">
              Staff
              <div>
                <Link href="/">
                  <Checkbox checkdefault />
                </Link>
              </div>
            </p>
            <p className="grid gap-2 grid-cols-2 text-[20px]">
              Admin
              <div>
                <Link href="/Admin/SigninForm">
                  <Checkbox enabled />
                </Link>
              </div>
            </p>
          </motion.div>

          {/* SigninForm */}
          <motion.div
            className="pr-1 pl-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <SigninForm className="   " />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
