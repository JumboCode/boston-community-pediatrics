import bcp_logo from "../assets/icons/BCP.svg";
import rando from "../assets/icons/Ellipse 1.svg";
import React from "react";
import Image from 'next/image'
import Link from "next/link";

//Figma had the three links as small, but it's a simple change later if needed - Jeremiah
const NavBar: React.FC = () => {
    return (
        <nav className="bg-[#234254] px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Link href="/" className="flex items-center gap-4">
                <Image src={bcp_logo} alt="BCP Logo" className="w-auto h-12"/></Link>
            <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <li><a href="#/" className="text-white text-small">About Us</a></li>
                <li><a href="#/" className="text-white text-small">Connect</a></li>
                <li><a href="#/" className="bg-[#426982] text-white text-small px-3 py-2 rounded text-center">Volunteer</a></li>
                <span className="text-white font-medium">Username</span>
                <Image src={rando} alt="Placholder User " className="prof"/>
            </ul>
        </nav>
    );
}

export default NavBar;