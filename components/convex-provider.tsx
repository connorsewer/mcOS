"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useState, useEffect, createContext, useContext } from "react";

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

// Context to signal when Convex is ready (client-side hydration complete)
const ConvexReadyContext = createContext<boolean>(false);

/**
 * Hook to check if Convex provider is ready.
 * Use this in hooks before calling useQuery to avoid SSR errors.
 */
export function useConvexReady(): boolean {
  return useContext(ConvexReadyContext);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Create client only on mount (client-side)
    const convexClient = createConvexClient();
    setClient(convexClient);
    if (convexClient) {
      setReady(true);
    }
  }, []);

  // Always render children (for SSR), but wrap in ready context
  // If client is ready, also wrap in ConvexProvider
  if (!client) {
    return (
      <ConvexReadyContext.Provider value={false}>
        {children}
      </ConvexReadyContext.Provider>
    );
  }

  return (
    <ConvexProvider client={client}>
      <ConvexReadyContext.Provider value={ready}>
        {children}
      </ConvexReadyContext.Provider>
    </ConvexProvider>
  );
}