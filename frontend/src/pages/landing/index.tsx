import { motion } from "framer-motion";
import UserProfile from "@/components/user-profile";
import { useAuth } from "@/context/AuthContext";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { type Variants, type RepeatType } from "framer-motion";
const HomePage = () => {
  const letters = [
    { text: "Djan", color: "#00FFA3" },  // neon green
    { text: "React", color: "#29ABE2" }, // neon blue
    { text: "JWT", color: "#FF6D00" },   // neon orange
  ];

    const blobVariants: Variants = {
      animate: {
        scale: [0.9, 1.1, 0.9],
        x: [-60, 80, -60],
        y: [-70, 60, -70],
        transition: {
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror" as RepeatType,
          ease: "easeInOut",
        },
      },
    };

  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative flex justify-center items-center h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      
      {/* Top-right Auth Section */}
      <div className="absolute top-6 right-6">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-gray-300">
            <Loader2Icon className="animate-spin h-5 w-5" />
            <span>Loading...</span>
          </div>
        ) : user ? (
          <UserProfile user={user} />
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className="bg-[#29ABE2] hover:bg-[#00FFA3] text-white font-semibold px-5 py-2 rounded-md transition-all duration-300 hover:scale-105 hover:text-black shadow-lg shadow-[#00FFA3]/30"
          >
            Login
          </Button>
        )}
      </div>

      {/* Animated Blobs */}
      {[
        { bg: "#ff4f81", size: "w-96 h-96", top: "-10%", left: "-10%", blur: "blur-3xl", opacity: "opacity-50" },
        { bg: "#29ABE2", size: "w-80 h-80", top: "25%", left: "65%", blur: "blur-2xl", opacity: "opacity-40" },
        { bg: "#00FFA3", size: "w-72 h-72", top: "60%", left: "20%", blur: "blur-3xl", opacity: "opacity-30" },
      ].map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute ${blob.size} rounded-full mix-blend-screen filter ${blob.blur} ${blob.opacity}`}
          style={{ backgroundColor: blob.bg, top: blob.top, left: blob.left }}
          variants={blobVariants}
          animate="animate"
        />
      ))}

      {/* Draggable Neon Text */}
      <div className="relative flex flex-wrap justify-center items-center gap-6">
        {letters.map((letter, index) => (
          <motion.div
            key={index}
            drag
            dragElastic={0.7}
            whileTap={{ scale: 1.2 }}
            whileHover={{
              scale: 1.15,
              textShadow: `
                0 0 10px ${letter.color},
                0 0 20px ${letter.color},
                0 0 40px ${letter.color}`,
            }}
            className="cursor-grab active:cursor-grabbing select-none"
          >
            <motion.span
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.3,
                type: "spring",
                stiffness: 120,
                damping: 14,
              }}
              style={{
                color: letter.color,
                fontSize: "5rem",
                fontWeight: "900",
                letterSpacing: "0.05em",
                textShadow: `0 0 10px ${letter.color}, 0 0 30px ${letter.color}`,
              }}
            >
              {letter.text}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-16 text-lg text-gray-300 tracking-wide"
      >
        <span className="text-[#00FFA3] font-semibold">Made by</span> ✦ WareBar
      </motion.p>
    </div>
  );
};

export default HomePage;
