import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";

import { z } from "zod";

export const customSendTransaction = customActionProvider<EvmWalletProvider>({
  name: "customSendTransaction",
  description: "Send eth transaction directory by customeSendTransaction",
  schema: z.object({
    to: z.string().describe("to address"),
    value: z.string().describe("value"),
    data: z.string().describe("data"),
  }),
  invoke: async (walletProvider, args: any) => {
    const { to, value, data } = args;
    const hash = await walletProvider.sendTransaction({ to, value, data });
    return `The hash ${hash}`;
  },
});
