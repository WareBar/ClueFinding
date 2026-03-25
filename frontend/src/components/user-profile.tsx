// @ts-nocheck

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const UserProfile = ({ user }) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Helper: get initials if no avatar image
  const getInitials = (email) => {
    if (!email) return "U";
    return email[0].toUpperCase();
  };

  return (
    <div className="text-white z-50 relative">
      {/* Avatar + Email */}
      <div
        className="flex items-center gap-3 cursor-pointer bg-white/10 px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/20 transition"
        onClick={() => setOpen(!open)}
      >
        {/* Avatar */}
        <Avatar className="h-8 w-8 border border-white/20">
          <AvatarImage
            src={user?.avatar}
            alt={user?.email || "User avatar"}
          />
          <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
        </Avatar>

        {/* Email */}
        <span className="hidden sm:block">{user?.email}</span>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-44 bg-[#1f1b3a] rounded-lg shadow-lg overflow-hidden border border-white/10"
          >
            <button
              className="w-full px-4 py-2 text-left text-white hover:bg-[#2d2665] transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
