"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type AdminState = "loading" | "admin" | "not-admin";

let cachedPromise: Promise<boolean> | null = null;
let cachedUserId: string | null = null;

async function fetchIsAdmin(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/users?id=${encodeURIComponent(userId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.role === "ADMIN";
  } catch {
    return false;
  }
}

export function useIsAdmin(): { isAdmin: boolean; state: AdminState } {
  const { user, isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<AdminState>("loading");

  useEffect(() => {
    if (!isLoaded) {
      setState("loading");
      return;
    }
    if (!isSignedIn || !user?.id) {
      setState("not-admin");
      return;
    }

    if (cachedUserId !== user.id) {
      cachedUserId = user.id;
      cachedPromise = fetchIsAdmin(user.id);
    }

    let cancelled = false;
    (cachedPromise ?? Promise.resolve(false)).then((isAdmin) => {
      if (cancelled) return;
      setState(isAdmin ? "admin" : "not-admin");
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user?.id]);

  return { isAdmin: state === "admin", state };
}
