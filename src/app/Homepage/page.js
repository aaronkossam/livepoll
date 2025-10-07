"use client";
import React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import SigninForm from "../User/clientSignInForm/page";
import AdminSignin from "../Admin/SigninForm/page";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Homepage = () => {
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith("/Admin");
  const isStaffPage = pathname === "/";

  return (
    <div
      style={{
        backgroundImage: `
      linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
      url("/Artboard 3.jpg")
    `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="bg-cover bg-center h-screen text-white"
    >
      <div className="xl:justify-end 2xl:pt-64 justify-center flex 2xl:pr-14 lg:justify-end lg:pr-7">
        <div className="pt-16">
          {/* Title */}
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
            {/* Staff Option */}
            <div className="grid gap-2 grid-cols-2 pl-9  text-[20px] items-center">
              <span>Staff</span>
              <Link href="/">
                <Checkbox checked={isStaffPage} readOnly />
              </Link>
            </div>

            {/* Admin Option */}
            <div className="grid gap-2 grid-cols-2 text-[20px] items-center">
              <span>Admin</span>
              <Link href="/Admin/SigninForm">
                <Checkbox checked={isAdminPage} readOnly />
              </Link>
            </div>
          </motion.div>

          {/* SigninForm */}
          <motion.div
            className="pr-1 pl-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {isAdminPage ? <AdminSignin /> : <SigninForm />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
