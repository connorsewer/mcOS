"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      setError("NEXT_PUBLIC_CONVEX_URL is not set");
      return;
    }
    try {
      const convex = new ConvexReactClient(url);
      setClient(convex);
    } catch (err) {
      setError(`Failed to initialize Convex: ${err}`);
    }
  }, []);

  // While initializing, render children without provider (will show skeletons)
  if (!client) {
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-500 mb-2">Configuration Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
