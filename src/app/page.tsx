"use client";
import React, { useState } from "react";

export default function Home() {
  const [volunteers, setVolunteers] = useState([
    {
      id: 1,
      name: "Participant Name",
      email: "participant@email.com",
      phone: "123-456-7890",
      selected: false,
    },
    {
      id: 2,
      name: "Participant Name",
      email: "participant@email.com",
      phone: "123-456-7890",
      selected: false,
    },
    {
      id: 3,
      name: "Participant Name",
      email: "participant@email.com",
      phone: "123-456-7890",
      selected: false,
    },
    {
      id: 4,
      name: "Participant Name",
      email: "participant@email.com",
      phone: "123-456-7890",
      selected: false,
    },
    {
      id: 5,
      name: "Participant Name",
      email: "participant@email.com",
      phone: "123-456-7890",
      selected: false,
    },
    {
      id: 6,
      name: "Participant Name",
      email: "participant@email.com",
      phone: "123-456-7890",
      selected: false,
    },
    {
      id: 7,
      name: "Participant Name",
      email: "participant@email.com",
      phone: "123-456-7890",
      selected: false,
    },
  ]);

  const toggleSelect = (id: number) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };

  // Check if at least one volunteer is selected
  const anySelected = volunteers.some((v) => v.selected);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-[996px] bg-white border border-black shadow-md font-sans z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          {/* Left */}
          <div className="space-y-2 text-gray-600 px-5 pt-5">
            <h1 className="text-[24px] font-semibold">Position Name</h1>
            <p>123 ABC Street, Boston MA 12345</p>
            <p>10:00AM - 3:00PM</p>
            <p className="text-[24px] font-medium">12/23 Spots Filled</p>
          </div>

          {/* Right */}
          <div className="mt-4 md:mt-0 md:w-1/2 text-[24px] text-gray-600 leading-relaxed">
            <p className="leading-relaxed text-[16px] mb-2">
              Lorem ipsum dolor sit amet consectetur. Neque tellus bibendum
              etiam purus volutpat amet faucibus nibh nunc. Lacus quam pretium
              vitae dignissim. Nibh et tempus venenatis scelerisque enim egestas
              vestibulum tempor. Aliquam sit pretium tellus at molestie diam
              erat eget eget. Sagittis aliquam orci feugiat vitae. `
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className="bg-[#234254] h-3 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Volunteer Table */}
        <table className="w-full border-white-700 text-gray-600">
          <thead>
            <tr className="bg-white-100 text-left">
              <th className="py-3 px-4"></th>
              <th className="py-3 px-29">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4 text-center">Select all</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((p) => (
              <tr
                key={p.id}
                className={`border-t border-gray-300 border-b transition-colors duration-200 ${
                  p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                }`}
              >
                <td className="py-3 px-6">{p.id}</td>
                <td className="py-3 px-4 flex items-center gap-15">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  {p.name}
                </td>
                <td className="py-3 px-4">{p.email}</td>
                <td className="py-3 px-4">{p.phone}</td>
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={p.selected}
                    onChange={() => toggleSelect(p.id)}
                    className="w-5 h-5 accent-[#234254] cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Buttons */}
        {anySelected && (
          <div className="border-t border-gray-200 bg-gray-50 w-full">
            <div className="flex justify-between pl-6 pr-6 pb-6 mt-6">
              <button className="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]">
                Send email
              </button>
              <button className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400">
                Remove from event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
