"use client";
import bcp_logo from "@/assets/icons/BCP.svg";
import blankProfile from "@/assets/icons/empty-profile-picture.svg";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "@headlessui/react";

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
              <Link href="/event/createEvent" className="text-white text-sm">
                Create Event
              </Link>
            </li>
            <li>
              <Link href="/" className="text-white text-sm">
                Contact Volunteers
              </Link>
            </li>
            <li className="relative">
              <Menu>
                <Menu.Button className="text-white text-sm cursor-pointer">
                  Manage
                </Menu.Button>

                <Menu.Items className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/manage/events"
                        className={`block px-4 py-2 text-sm ${
                          active ? "bg-blue-500 text-white" : "text-black"
                        }`}
                      >
                        Events
                      </Link>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/manage/volunteers"
                        className={`block px-4 py-2 text-sm ${
                          active ? "bg-blue-500 text-white" : "text-black"
                        }`}
                      >
                        Volunteers
                      </Link>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
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
