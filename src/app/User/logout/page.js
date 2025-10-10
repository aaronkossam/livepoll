"use client";
import { useAuth } from "../../Context/AuthoContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Button
      variant="outline"
      className="button mt-14 text-white
        bg-gradient-to-br from-indigo-600 to-purple-600 "
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
