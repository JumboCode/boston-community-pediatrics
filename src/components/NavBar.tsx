"use client";
import bcp_logo from "@/assets/icons/BCP.svg";
import blankProfile from "@/assets/icons/empty-profile-picture.svg";
import React from "react";
import Image from "next/image";
import Link from "next/link";
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
        console.log('/api/users?id=' + user?.id);
        const res = await fetch('/api/users?id=' + user?.id);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setIsAdmin(data?.role == 'ADMIN');
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [user, isLoaded, isSignedIn]);

  return (
    <>
    {isAdmin ? <AdminNavBar /> : <UserNavBar />}
    {console.log("isAdmin:", isAdmin)}
    </>
  );
}

export default NavBar;
