'use client' ;

import { ChakraProvider } from "@chakra-ui/react";

import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  hardhat,
  sepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const queryClient = new QueryClient();


const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'd661c872043d1e8247f5e94145b3a695',
  chains: [hardhat, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ChakraProvider>{children}</ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>
      </body>
    </html>
  );
}
