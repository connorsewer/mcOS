'use client';

import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { FunctionReference } from "convex/server";

// Safe wrapper that returns undefined if Convex isn't available (SSR/build)
export function useQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args?: any
) {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    return useConvexQuery(query, args);
  } catch (e) {
    // Convex not available (no provider)
    return undefined;
  }
}

export function useMutation<Mutation extends FunctionReference<'mutation'>>(
  mutation: Mutation
) {
  if (typeof window === 'undefined') {
    return async () => { throw new Error('Convex not available during SSR'); };
  }
  try {
    return useConvexMutation(mutation);
  } catch (e) {
    return async () => { throw new Error('Convex mutation not available'); };
  }
}
