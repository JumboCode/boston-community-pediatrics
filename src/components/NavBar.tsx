"use client";
import { useUser } from "@clerk/nextjs";
import UserNavBar from "./UserNavBar";
import AdminNavBar from "./AdminNavBar";
import { useState, useEffect } from "react";

function NavBar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    async function fetchUser() {
      try {
        const res = await fetch("/api/users?id=" + user?.id);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setIsAdmin(data?.role == "ADMIN");
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [user?.id, isLoaded, isSignedIn]);

  if (isAdmin === null) return null;

  return <>{isAdmin ? <AdminNavBar /> : <UserNavBar />}</>;
}

export default NavBar;
