"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Create client once at module level
// Use NEXT_PUBLIC_ prefix for client-side env vars, fallback to CONVEX_URL for server
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
let client: ConvexReactClient | null = null;

function getConvexClient() {
  if (!client) {
    if (!CONVEX_URL) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set");
      // This will cause hooks to fail gracefully with undefined
      client = new ConvexReactClient("https://dummy.convex.cloud");
    } else {
      client = new ConvexReactClient(CONVEX_URL);
    }
  }
  return client;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={getConvexClient()}>{children}</ConvexProvider>;
}
