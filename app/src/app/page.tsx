"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const RoomPage = () => {
  const y = 190; // Set bottom position
  const xFactor = 200;

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

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (message.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSpeaking(true);
        setPosition({ x: 240, y }); // Move character to x 240 when speaking
        setTimeout(() => setIsSpeaking(false), 3000); // Bubble disappears after 3 seconds
        setMessage(""); // Clear message after submitting
      }, 1000); // Simulate loading delay
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl + Enter → Insert newline
        e.preventDefault();
        setMessage((prev) => prev + "\n");
      } else {
        // Enter → Submit
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col items-center justify-center text-white">
      <header className="text-4xl font-bold mb-6 text-green-300 mt-4">
        PalWallet
      </header>
      <div
        className="relative w-[360px] h-[360px] bg-cover bg-center"
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
        className="mt-4 flex flex-col items-center w-full max-w-md p-4"
      >
        <textarea
          className="w-full h-32 p-2 border rounded-md bg-black text-green-400 border-green-500 shadow-[0px_0px_8px_rgba(0,255,0,0.5)] tracking-widest text-lg leading-tight caret-green-300 outline-none focus:ring-0 focus:border-green-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} // Handle key events
          placeholder="Type a message..."
          style={{
            backgroundImage:
              "radial-gradient(rgba(0, 255, 0, 0.2) 8%, transparent 10%)",
            backgroundSize: "8px 8px",
          }}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!message || isLoading}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default RoomPage;
