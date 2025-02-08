"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaPlugCircleBolt } from "react-icons/fa6";

import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Web3Wallet, Web3WalletTypes } from "@walletconnect/web3wallet";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectInput, setConnectInput] = useState("");

  const [web3wallet, setWeb3Wallet] = useState<any>();
  const [uri, setUri] = useState("");
  const [proposerName, setProposerName] = useState("");
  const [proposerUrl, setProposerUrl] = useState("");
  const [proposerIcon, setProposerIcon] = useState("");
  const [topic, setTopic] = useState("");
  const sessionEstablished = useRef(false);

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

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_CHAT_API || "http://localhost:8080/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.NEXT_PUBLIC_BASIC_AUTH
              ? "Basic " + btoa(process.env.NEXT_PUBLIC_BASIC_AUTH)
              : "",
          },
          body: JSON.stringify({ message }),
        }
      );

      const data = await response.json();

      // Concat all response strings into a single message
      const concatenatedMessage =
        data.response?.join(" ") || "No response received.";

      setResponseMessage(concatenatedMessage);
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("Error: Unable to send the message.");
    } finally {
      setIsLoading(false);
      setIsSpeaking(true);
      setPosition({ x: 240, y });
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

  const handleConnect = async () => {
    const core = new Core({
      projectId:
        process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
        "3a8170812b534d0ff9d794f19a901d64",
    });
    const web3wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: "PalWallet",
        description: "This is PalWallet",
        url: "2025-agents-palwallet.vercel.app",
        icons: ["https://2025-agents-palwallet.vercel.app/icon.png"],
      },
    });
    setWeb3Wallet(web3wallet);
    web3wallet.on(
      "session_proposal",
      async ({ id, params }: Web3WalletTypes.SessionProposal) => {
        try {
          const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
              eip155: {
                chains: [`eip155:84532`],
                methods: ["eth_sendTransaction", "personal_sign"],
                events: ["accountsChanged", "chainChanged"],
                accounts: [`eip155:84532:${process.env.NEXT_PUBLIC_ADDRESS}`],
              },
            },
          });
          const { topic } = await web3wallet.approveSession({
            id,
            namespaces: approvedNamespaces,
          });
          console.log("walletConnect: session approved", topic);
          setProposerName(params.proposer.metadata.name);
          setProposerUrl(params.proposer.metadata.url);
          setProposerIcon(params.proposer.metadata.icons[0]);
          setTopic(topic);
          sessionEstablished.current = true;
          setConnectInput("");
          setIsModalOpen(false);
        } catch (error) {
          console.log("walletConnect: error", error);
          await web3wallet.rejectSession({
            id: id,
            reason: getSdkError("USER_REJECTED"),
          });
        }
      }
    );

    web3wallet.on(
      "session_request",
      async (event: Web3WalletTypes.SessionRequest) => {
        const { topic, params, id } = event;
        if (params.request.method != "eth_sendTransaction") {
          throw new Error("Unsupported method");
        }
        const [{ to, value, data }] = params.request.params;
        console.log("to", to);
        console.log("value", value);
        console.log("data", data);
      }
    );
    web3wallet.pair({ uri: connectInput });
  };

  useEffect(() => {
    if (web3wallet && topic) {
      return () => {
        web3wallet.disconnectSession({
          topic,
          reason: getSdkError("USER_DISCONNECTED"),
        });
      };
    }
  }, [web3wallet, topic]);

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
        className="text-5xl font-bold mt-2 mb-6"
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
        <FaPlugCircleBolt
          className="absolute bottom-2 left-2 text-gray-600 text-3xl cursor-pointer hover:text-green-500"
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-col items-center w-full max-w-md z-10 p-4"
      >
        <textarea
          className="w-full h-32 p-2 border rounded-md bg-black text-green-400 border-green-500 shadow-[0px_0px_8px_rgba(0,255,0,0.5)] text-lg leading-tight caret-green-300 outline-none focus:ring-0 focus:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
            ...(isLoading || isSpeaking
              ? {
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "rgba(0, 255, 0, 0.3)",
                  borderColor: "rgba(0, 255, 0, 0.3)",
                  boxShadow: "0px 0px 4px rgba(0,255,0,0.2)",
                }
              : {}),
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
      {/* Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-full max-w-lg m-2">
            <h2 className="text-xl font-bold mb-4">dApps Fusion</h2>
            <input
              type="text"
              className="w-full p-2 border rounded-md bg-black text-green-400 border-green-500 outline-none focus:ring-0 focus:border-green-400"
              placeholder="Enter wallet connect url..."
              value={connectInput}
              onChange={(e) => setConnectInput(e.target.value)}
            />
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                onClick={handleConnect}
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
