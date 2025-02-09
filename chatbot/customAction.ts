import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";

import { z } from "zod";

export const myActionPalWalletCustomFunction =
  customActionProvider<EvmWalletProvider>({
    name: "my-action-pal-wallet-custom-function",
    description:
      "If user send message with my-action-pal-wallet-custom-function, this method is called",
    schema: z.object({
      to: z.string().describe("to address"),
      value: z.string().describe("value"),
      data: z.string().describe("data"),
    }),
    invoke: async (walletProvider, args: any) => {
      console.log("my-action-pal-wallet-custom-function");
      const { to, value, data } = args;

      console.log("to", to);
      console.log("value", value);
      console.log("data", data);

      try {
        const hash = await walletProvider.sendTransaction({
          from: "0x404F9eD93F2813fD3002A00C1d2CED06948C87BB",
          to,
          value,
          data,
        });

        console.log("hash", hash);
        return `The hash ${hash}`;
      } catch (e) {
        console.log("error", e);
        return "Tx failed: " + e;
      }
    },
  });

export const myActionPalWalletSimlate = customActionProvider<EvmWalletProvider>(
  {
    name: "my-action-pal-wallet-simulate",
    description:
      "If user send message with my-action-pal-wallet-simulate, this method is called",
    schema: z.object({
      to: z.string().describe("to address"),
      value: z.string().describe("value"),
      data: z.string().describe("data"),
    }),
    invoke: async (walletProvider, args: any) => {
      console.log("my-action-pal-wallet-simulate");
      const { to, value, data } = args;

      const address = await walletProvider.getAddress();
      console.log("from", address);
      console.log("to", to);
      console.log("value", value);
      console.log("data", data);

      try {
        // todo: implement some security tool here

        return `Simlation success, and no risk detected`;
      } catch (e) {
        console.log("error", e);
        return "Simlation failed: " + e;
      }
    },
  }
);
