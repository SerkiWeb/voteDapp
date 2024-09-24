'use client';

import Image from "next/image";
import styles from "./page.module.css";
import { Layout } from "@/component/layout";
import Vote from "@/component/vote";
import NotConnected from "@/component/notConnected";
import { useAccount } from "wagmi";

export default function Home() {
  
  const { address, isConnected } = useAccount();

  return (
    <Layout>
      {isConnected ? (
        <Vote />
      ): (
        <NotConnected/>
      )}
    </Layout>
  );
}
