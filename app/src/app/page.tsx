"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const RoomPage = () => {
  const y = 190;
  const xFactor = 200;

  const [position, setPosition] = useState({ x: Math.random() * xFactor, y });
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sparkles, setSparkles] = useState<any>([]);

  useEffect(() => {
    const moveCharacter = () => {
      if (!isSpeaking) {
        setPosition({
          x: Math.random() * xFactor,
          y,
        });
      }
      setVisible(true);
    };

    moveCharacter();
    const interval = setInterval(moveCharacter, 2000);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  useEffect(() => {
    const createSparkles = () => {
      const newSparkles = Array.from({ length: 20 }, () => ({
        id: Math.random(),
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        size: Math.random() * 7 + 4,
        opacity: Math.random() * 0.9 + 0.3,
        duration: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? "bg-green-400" : "bg-purple-400",
      }));
      setSparkles(newSparkles);
    };
    createSparkles();
    const sparkleInterval = setInterval(createSparkles, 3000);
    return () => clearInterval(sparkleInterval);
  }, []);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (message.trim()) {
      setIsLoading(true);
      setMessage("");
      setTimeout(() => {
        setIsLoading(false);
        setIsSpeaking(true);
        setResponseMessage(
          "This is a sample response message that appears inside the message bubble. You can replace this with an actual AI response.This is a sample response message that appears inside the message bubble. You can replace this with an actual AI response.This is a sample response message that appears inside the message bubble. You can replace this with an actual AI response.This is a sample response message that appears inside the message bubble. You can replace this with an actual AI response."
        );
        setPosition({ x: 240, y });
      }, 1000);
    }
  };

  const handleAcknowledge = () => {
    setIsSpeaking(false);
    setResponseMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setMessage((prev) => prev + "\n");
      } else {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col items-center justify-center text-white overflow-hidden">
      {sparkles.map((sparkle: any) => (
        <motion.div
          key={sparkle.id}
          className={`absolute rounded-full shadow-lg ${sparkle.color}`}
          style={{
            width: sparkle.size,
            height: sparkle.size,
            left: sparkle.x,
            top: sparkle.y,
            opacity: sparkle.opacity,
          }}
          animate={{ opacity: [0, sparkle.opacity, 0] }}
          transition={{ duration: sparkle.duration, repeat: Infinity }}
        />
      ))}
      <motion.header
        className="text-5xl font-bold mb-6"
        animate={{ color: ["#22c55e", "#a855f7", "#22c55e"] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      >
        PalWallet
      </motion.header>
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
          <div className="absolute">
            <div className="relative w-[360px]">
              <img src="/bubble.png" alt="Speaking Bubble" className="w-full" />
              <div className="absolute inset-0 flex flex-col items-start justify-start ml-4 mr-2 my-2 text-black text-sm h-32 overflow-y-scroll">
                {responseMessage}
              </div>
            </div>
          </div>
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
        className="mt-4 flex flex-col items-center w-full max-w-md z-10 p-4"
      >
        <textarea
          className="w-full h-32 p-2 border rounded-md bg-black text-green-400 border-green-500 shadow-[0px_0px_8px_rgba(0,255,0,0.5)] text-lg leading-tight caret-green-300 outline-none focus:ring-0 focus:border-green-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? "Loading..."
              : isSpeaking
              ? "Please check the response..."
              : "Type a message..."
          }
          disabled={isLoading || isSpeaking}
          style={{
            backgroundImage:
              "radial-gradient(rgba(0, 255, 0, 0.2) 8%, transparent 10%)",
            backgroundSize: "8px 8px",
          }}
        />
        {isSpeaking ? (
          <button
            type="button"
            onClick={handleAcknowledge}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            I got it
          </button>
        ) : (
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!message || isLoading}
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        )}
      </form>
    </div>
  );
};

export default RoomPage;
