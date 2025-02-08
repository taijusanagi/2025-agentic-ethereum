"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const RoomPage = () => {
  const y = 220; // Set bottom position
  const xFactor = 250;

  const [position, setPosition] = useState({ x: Math.random() * xFactor, y });
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const moveCharacter = () => {
      if (!isSpeaking) {
        setPosition({
          x: Math.random() * xFactor,
          y, // Keep y fixed at bottom
        });
      }
      setVisible(true);
    };

    moveCharacter();

    const interval = setInterval(moveCharacter, 2000);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSpeaking(true);
        setPosition({ x: 240, y }); // Move character to x 240 when speaking
        setTimeout(() => setIsSpeaking(false), 3000); // Bubble disappears after 3 seconds
      }, 1000); // Simulate loading delay
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen relative">
      <div
        className="relative w-[400px] h-[400px] bg-cover bg-center"
        style={{ backgroundImage: "url('/room.png')" }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {isSpeaking && (
          <img
            src="/bubble.png"
            alt="Speaking Bubble"
            className="absolute w-[380px] top-[10px] left-1/2 transform -translate-x-1/2"
          />
        )}
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
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col items-center w-full max-w-md"
      >
        <textarea
          className="w-full h-20 p-2 border rounded-md"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!message || isLoading}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default RoomPage;
