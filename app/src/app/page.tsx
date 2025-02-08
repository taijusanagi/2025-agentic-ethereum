"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const RoomPage = () => {
  const y = 220; // Set bottom position
  const xFactor = 240;

  const [position, setPosition] = useState({ x: Math.random() * xFactor, y });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const moveCharacter = () => {
      setPosition((prev) => ({
        x: Math.random() * xFactor,
        y, // Keep y fixed at bottom
      }));
      setVisible(true);
    };

    moveCharacter();

    const interval = setInterval(moveCharacter, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-[400px] h-[400px] bg-cover bg-center"
      style={{ backgroundImage: "url('/room.png')" }}
    >
      {visible && (
        <motion.img
          src="/character.png"
          alt="Character"
          className="absolute w-40 h-40"
          initial={{ opacity: 0, y }}
          animate={{ x: position.x, y: position.y, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};

export default RoomPage;
