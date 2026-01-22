"use client";
import bcp_logo from "@/assets/icons/BCP.svg";
import blankProfile from "@/assets/icons/empty-profile-picture.svg";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import UserNavBar from "./UserNavBar";
import AdminNavBar from "./AdminNavBar";
import { is } from "zod/locales";
import { useAuth } from "@clerk/nextjs";
import { getUserById } from "@/app/api/users/controller";
import { useState, useEffect } from "react";

function NavBar() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        console.log("isloaded: ", isLoaded);
        console.log("user.id: ", user?.id);
        console.log('/api/users?email=' + user?.emailAddresses[0]?.emailAddress);
        const res = await fetch('/api/users?email=' + user?.emailAddresses[0]?.emailAddress);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setIsAdmin(data?.role == 'ADMIN');
        console.log("fetched user role: ", data?.role);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [user, isLoaded]);

  return (
    <>
    {/* {<AdminNavBar />} */}
    {isAdmin ? <AdminNavBar /> : <UserNavBar />}
    {console.log("isAdmin:", isAdmin)}
    </>
  );
}

export default NavBar;
