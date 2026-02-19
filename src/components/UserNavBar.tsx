"use client";
import bcp_logo from "@/assets/icons/BCP.svg";
import blankProfile from "@/assets/icons/empty-profile-picture.svg";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

function getR2ImageUrl(fileName?: string) {
  if (!fileName) return null; // fallback to placeholder
  const endpoint = process.env.NEXT_PUBLIC_R2_ENDPOINT;
  const bucket = process.env.NEXT_PUBLIC_R2_BUCKET;
  return `${endpoint}${bucket}/${fileName}`;
}

function UserNavBar() {
  const { user, isSignedIn, isLoaded } = useUser();

  const firstName = user?.firstName ?? "Guest";

  return (
    <nav className="bg-[#234254] px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <ul className="flex flex-col md:flex-row md:items-center justify-between w-full">
        <li>
          <Link href="/" className="flex items-center gap-4">
            <Image
              src={bcp_logo}
              alt="BCP Logo"
              className="w-auto h-12"
              priority
            />
          </Link>
        </li>
        <li>
          <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <li>
              <Link
                href="https://www.bostoncommunitypediatrics.org/"
                className="text-white text-sm"
              >
                Connect
              </Link>
            </li>
            <li>
              <Link
                href="/event"
                className="bg-[#426982] text-white text-sm px-3 py-2 rounded text-center"
              >
                Volunteer
              </Link>
            </li>
            {isSignedIn ? (
              <li className="flex items-center gap-2">
                <span className="text-white font-medium">{firstName}</span>
                <Link href="/profile">
                  <Image
                    src={blankProfile}
                    alt="Placeholder User"
                    className="w-8 h-8 rounded-full"
                  />
                  
                </Link>
              </li>
            ) : (
              <li className="flex items-center gap-2">
                <Link href="/login" className="text-white font-medium">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export default UserNavBar;
