"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useState, useEffect } from "react";

// Global singleton for the Convex client
let globalConvexClient: ConvexReactClient | undefined;

function createConvexClient(): ConvexReactClient | undefined {
  if (typeof window === "undefined") return undefined;
  
  if (!globalConvexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set");
      return undefined;
    }
    globalConvexClient = new ConvexReactClient(url);
  }
  
  return globalConvexClient;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Create client synchronously on first render (only runs on client due to 'use client')
  // But use useState to avoid creating during SSR
  const [client] = useState(() => createConvexClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render without provider
  // After mount, render with provider
  if (!mounted || !client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}