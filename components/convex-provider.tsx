"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

// Get the Convex URL from environment
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create client lazily to avoid initialization errors during build
function createConvexClient() {
  if (!CONVEX_URL) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not set");
    return null;
  }
  try {
    return new ConvexReactClient(CONVEX_URL);
  } catch (e) {
    console.error("Failed to create Convex client:", e);
    return null;
  }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only create client on the client side
    const c = createConvexClient();
    setClient(c);
    setIsReady(true);
  }, []);

  if (!isReady) {
    // Render children without provider during SSR/initial render
    return <>{children}</>;
  }

  if (!client) {
    // If no client, render children without provider
    // Hooks will return undefined which components should handle
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}