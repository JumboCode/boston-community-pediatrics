"use client";
import bcp_logo from "@/assets/icons/BCP.svg";
import blankProfile from "@/assets/icons/Group 1.svg";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface UserNavBarProps {
  profileImageUrl: string | null;
}

function UserNavBar(props: UserNavBarProps) {
  const { profileImageUrl } = props;
  const { user, isSignedIn } = useUser();
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
                    src={profileImageUrl ?? blankProfile}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    unoptimized={!!profileImageUrl}
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
