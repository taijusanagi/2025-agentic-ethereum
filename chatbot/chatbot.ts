import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import {
  myActionPalWalletRunDirect,
  myActionPalWalletSimlate,
} from "./customAction";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

let agent: any;
let config: any;

/**
 * Initialize the agent with CDP Agentkit
 */
async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    let walletDataStr: string | null = null;
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
      }
    }

    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    });

    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        myActionPalWalletSimlate,
        myActionPalWalletRunDirect,
        wethActionProvider(),
        pythActionProvider(),
        erc20ActionProvider(),
        walletActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
        }),
        cdpWalletActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
        }),
      ],
    });

    const tools = await getLangChainTools(agentkit);
    const memory = new MemorySaver();
    config = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

    agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
        faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
        funds from the user. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested.
      `,
    });

    // Save wallet data
    const exportedWallet = await walletProvider.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

    console.log("Agent initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

/**
 * API Endpoint for chat interaction
 */
app.post("/chat", async (req: any, res: any) => {
  try {
    const { message } = req.body;
    if (!message) {
      console.warn(`[WARN] Missing message in request.`);
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`[INFO] Received message: "${message}"`);

    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      config
    );

    let responseText = "";
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        responseText += chunk.agent.messages[0].content + "\n";
      } else if ("tools" in chunk) {
        responseText += chunk.tools.messages[0].content + "\n";
      }
    }
    console.log(`[INFO] Response generated: "${responseText}"`);

    res.json({ response: [responseText.trim()] });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Start the server after initializing the agent
 */
initializeAgent()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
