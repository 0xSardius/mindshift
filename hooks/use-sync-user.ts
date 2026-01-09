"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useSyncUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const syncUser = useMutation(api.mutations.syncUser);
  const convexUser = useQuery(api.queries.getCurrentUser);

  useEffect(() => {
    if (!isClerkLoaded || !clerkUser) return;

    // If we don't have a Convex user yet, sync from Clerk
    if (convexUser === undefined) {
      // Still loading
      return;
    }

    if (convexUser === null) {
      // No user in Convex, create one
      syncUser({
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: clerkUser.fullName || clerkUser.firstName || undefined,
        imageUrl: clerkUser.imageUrl || undefined,
      });
    }
  }, [isClerkLoaded, clerkUser, convexUser, syncUser]);

  return {
    user: convexUser,
    isLoading: !isClerkLoaded || convexUser === undefined,
    isAuthenticated: !!clerkUser,
  };
}
