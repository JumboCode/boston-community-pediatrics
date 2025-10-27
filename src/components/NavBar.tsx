import bcp_logo from "@/assets/icons/BCP.svg";
import blankProfile from "@/assets/icons/empty-profile-picture.svg";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-[#234254] px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <ul className="flex flex-col md:flex-row md:items-center justify-between w-full">
    <li>
      <Link href="/" className="flex items-center gap-4">
        <Image src={bcp_logo} alt="BCP Logo" className="w-auto h-12" priority />
      </Link>
    </li>
    <li>
      <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <li><Link href="/about" className="text-white text-sm">About Us</Link></li>
        <li><Link href="/connect" className="text-white text-sm">Connect</Link></li>
        <li>
          <Link
            href="/volunteer"
            className="bg-[#426982] text-white text-sm px-3 py-2 rounded text-center"
          >
            Volunteer
          </Link>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-white font-medium">Username</span>
          <Image src={blankProfile} alt="Placeholder User" className="w-8 h-8 rounded-full" />
        </li>
      </ul>
    </li>
  </ul>
</nav>
  );
};

export default NavBar;
