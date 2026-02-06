"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    // Only initialize on client side
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (url) {
      setClient(new ConvexReactClient(url));
    }
  }, []);

  // During SSR/hydration, render children without provider
  // The hooks will return undefined (loading state)
  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
