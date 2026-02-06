"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

// Dummy client for SSR - doesn't actually connect
const DUMMY_URL = "https://dummy.convex.cloud";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient>(() => {
    // Initialize with dummy URL for SSR
    return new ConvexReactClient(DUMMY_URL);
  });

  useEffect(() => {
    // Replace with real client on mount
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (url && url !== DUMMY_URL) {
      setClient(new ConvexReactClient(url));
    }
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
