"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo, useState, useEffect } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  const convex = useMemo(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      return null;
    }
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set");
      return null;
    }
    return new ConvexReactClient(url);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/build, render children without provider
  if (!mounted || !convex) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
