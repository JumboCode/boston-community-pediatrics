"use client";
import { useUser } from "@clerk/nextjs";
import UserNavBar from "./UserNavBar";
import AdminNavBar from "./AdminNavBar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

function NavBar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dbFirstName, setDbFirstName] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;

    // Clear state when the user logs out
    if (!isSignedIn || !user?.id) {
      setIsAdmin(false);
      setProfileImage(null);
      setDbFirstName("");
      return;
    }
    
    async function fetchUser() {
      try {
        const res = await fetch("/api/users?id=" + user?.id);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setIsAdmin(data?.role == "ADMIN");
        setDbFirstName(data?.firstName ?? "");
        if (data.profileImage) {
          setProfileImage(data.profileImage); // use URL directly
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [user?.id, isLoaded, isSignedIn, pathname]);

  if (isAdmin === null) return null;

  return (
    <>
      {isAdmin ? (
        <AdminNavBar profileImageUrl={profileImage} firstName={dbFirstName} />
      ) : (
        <UserNavBar profileImageUrl={profileImage} firstName={dbFirstName} />
      )}
    </>
  );
}

export default NavBar;
