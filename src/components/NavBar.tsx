"use client";
import { useUser } from "@clerk/nextjs";
import UserNavBar from "./UserNavBar";
import AdminNavBar from "./AdminNavBar";
import { useState, useEffect } from "react";
import ProfilePageSkeleton from "./ui/skeleton/ProfilePageSkeleton";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

function NavBar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
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
        // A signed-in Clerk user with no DB row gets 401 (requireUser() throws
        // before the route's 404 check) — or 404 in other cases. Either way
        // they exist in Clerk but not in Postgres, so route them to onboarding
        // to create the record. This is the global safety net for every signup
        // path (Google login, abandoned onboarding, failed email signup, etc.).
        if (res.status === 401 || res.status === 404) {
          if (pathname !== "/onboarding" && pathname !== "/sso-callback") {
            router.push("/onboarding");
          }
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setIsAdmin(data?.role === "ADMIN");
        setDbFirstName(data?.firstName ?? "");
        if (data.profileImage) {
          setProfileImage(data.profileImage); // use URL directly
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [user?.id, isLoaded, isSignedIn, pathname, router]);

  if (isAdmin === null) return <ProfilePageSkeleton/>;

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
