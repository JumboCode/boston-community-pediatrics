"use client";
import bcp_logo from "@/assets/icons/BCPlogo.png";
import blankProfile from "@/assets/icons/Group 1.svg";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import EditableImage from "./admin-editable/EditableImage";

interface UserNavBarProps {
  profileImageUrl: string | null;
  firstName?: string;
}

function UserNavBar(props: UserNavBarProps) {
  const { profileImageUrl, firstName: dbFirstName } = props;
  const { user, isSignedIn } = useUser();
  const firstName = (dbFirstName || user?.firstName) ?? "Guest";

  return (
    <nav className="bg-bcp-blue px-8 py-4">
      <ul className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full items-center md:items-center">
        {/* Logo */}
        <li>
          <EditableImage
            contentKey="navbar.logo"
            fallbackSrc={bcp_logo}
            alt="BCP Logo"
            className="w-auto h-12"
            priority
            wrapperClassName="h-12 flex items-center gap-4"
            pencilClassName="absolute -bottom-1.5 -right-1.5 z-10"
            pencilSize="sm"
            href="/"
            linkClassName="flex items-center"
          />
        </li>
        {/* Links row */}

        <li>
          <ul className="flex items-center gap-4 md:gap-6">
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
                className="bg-light-bcp-blue text-white text-sm px-4 py-2 rounded text-center"
              >
                Volunteer
              </Link>
            </li>
            {isSignedIn ? (
              <li className="flex items-center gap-2">
                <Link className="flex items-center gap-2" href="/profile">
                  <span className="text-white font-medium hidden md:inline">
                    {firstName}
                  </span>
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
              <li>
                <Link href="/login" className="text-white font-medium text-sm">
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
