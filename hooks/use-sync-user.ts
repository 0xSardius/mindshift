"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function useSyncUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const syncUser = useMutation(api.mutations.syncUser);
  const [hasSynced, setHasSynced] = useState(false);

  // Only query when Convex auth is ready
  const convexUser = useQuery(
    api.queries.getCurrentUser,
    isConvexAuthenticated ? {} : "skip"
  );

  useEffect(() => {
    // Wait for all auth systems to be ready
    if (!isClerkLoaded || !clerkUser) return;
    if (isConvexLoading || !isConvexAuthenticated) return;
    if (hasSynced) return;

    // If we don't have a Convex user yet, sync from Clerk
    if (convexUser === undefined) {
      // Still loading the query
      return;
    }

    if (convexUser === null) {
      // No user in Convex, create one
      setHasSynced(true);
      syncUser({
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: clerkUser.fullName || clerkUser.firstName || undefined,
        imageUrl: clerkUser.imageUrl || undefined,
      }).catch((error) => {
        console.error("Failed to sync user:", error);
        setHasSynced(false); // Allow retry
      });
    }
  }, [isClerkLoaded, clerkUser, convexUser, syncUser, isConvexAuthenticated, isConvexLoading, hasSynced]);

  return {
    user: convexUser,
    isLoading: !isClerkLoaded || isConvexLoading || convexUser === undefined,
    isAuthenticated: !!clerkUser && isConvexAuthenticated,
  };
}
