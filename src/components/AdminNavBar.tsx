"use client";
import bcp_logo from "@/assets/icons/BCP.svg";
import blankProfile from "@/assets/icons/empty-profile-picture.svg";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';


function AdminNavBar() {

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
              <Link href="/" className="text-white text-sm">
                Create Event
              </Link>
            </li>
            <li>
              <Link href="/" className="text-white text-sm">
                Contact Volunteers
              </Link>
            </li>
            <li className="relative">
                <Dropdown>
                    {/* Toggle button */}
                    <Dropdown.Toggle
                    id="manage-dropdown"
                    className="text-white"
                    >
                    Manage ▼
                    </Dropdown.Toggle>

                    {/* Dropdown menu */}
                    <Dropdown.Menu className="bg-white shadow-lg p-2 flex flex-col gap-2 mt-6.5 items-center">
                    <Dropdown.Item
                        href="/manage/events"
                        className="text-black px-4 py-2 rounded hover:bg-blue-500 transition-colors block"
                    >
                        Events
                    </Dropdown.Item>

                    <Dropdown.Item
                        href="/manage/volunteers"
                        className="text-black px-4 py-2 rounded hover:bg-blue-500 transition-colors block"
                    >
                        Volunteers
                    </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </li>
              <li className="flex items-center gap-2">
                <span className="text-white font-medium">Admin</span>
                <Image
                  src={blankProfile}
                  alt="Placeholder User"
                  className="w-8 h-8 rounded-full"
                />
              </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavBar;
