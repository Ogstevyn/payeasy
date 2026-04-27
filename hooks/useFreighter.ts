"use client";

import { useStellar } from "@/context/StellarContext";

/**
 * A custom hook to interact with the Freighter wallet.
 * This hook is a thin wrapper around the StellarContext.
 */
export default function useFreighter() {
  const {
    publicKey,
    isConnected,
    isFreighterInstalled,
    connect,
    disconnect,
    isConnecting,
    error,
  } = useStellar();

  return {
    publicKey,
    isConnected,
    isFreighterInstalled,
    connect,
    disconnect,
    isConnecting,
    error,
  };
}
