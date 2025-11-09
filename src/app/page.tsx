"use client";
import React, { useState } from "react";
import Button from "@/components/common/buttons/Button";
import EventAdminTable from "@/components/common/tables/EventAdminTable";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  selected: boolean;
}

const Home: React.FC = () => {
  const [volunteers, setVolunteers] = useState<User[]>([
    {
      id: "1",
      firstName: "Participant",
      lastName: "Name",
      emailAddress: "participant@email.com",
      phoneNumber: "123-456-7890",
      selected: false,
    },
    {
      id: "2",
      firstName: "Participant",
      lastName: "Name",
      emailAddress: "participant@email.com",
      phoneNumber: "123-456-7890",
      selected: false,
    },
    {
      id: "3",
      firstName: "Participant",
      lastName: "Name",
      emailAddress: "participant@email.com",
      phoneNumber: "123-456-7890",
      selected: false,
    },
    {
      id: "4",
      firstName: "Participant",
      lastName: "Name",
      emailAddress: "participant@email.com",
      phoneNumber: "123-456-7890",
      selected: false,
    },
    {
      id: "5",
      firstName: "Participant",
      lastName: "Name",
      emailAddress: "participant@email.com",
      phoneNumber: "123-456-7890",
      selected: false,
    },
    {
      id: "6",
      firstName: "Participant",
      lastName: "Name",
      emailAddress: "participant@email.com",
      phoneNumber: "123-456-7890",
      selected: false,
    },
    {
      id: "7",
      firstName: "Participant",
      lastName: "Name",
      emailAddress: "participant@email.com",
      phoneNumber: "123-456-7890",
      selected: false,
    },
  ]);

  const toggleSelect = (id: string) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
    );
  };
'use client';
import Button from "@/components/common/buttons/Button";

const Home: React.FC = () => {

  const handleClick = () => {
    console.log(`Button clicked!`);
  };

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

      {/* Main content */}
      {/* <div className='text-center space-y-6'>
        <h1 className='text-5xl font-extrabold animate-bounce'>
          Welcome to BCP!
        </h1>
        <p className='text-xl text-white/90'>
          Your go-to platform for managing volunteers, events, and more.
        </p>
        <button className='bg-white text-blue-600 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all'>
          Get Started
        </button> */}
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <EventAdminTable
          position="Position Name"
          startTime="10:00 AM"
          endTime="3:00 PM"
          description="Lorem ipsum dolor sit amet consectetur. Neque tellus bibendum
              etiam purus volutpat amet faucibus nibh nunc. Lacus quam pretium
              vitae dignissim. Nibh et tempus venenatis scelerisque enim egestas
              vestibulum tempor. Aliquam sit pretium tellus at molestie diam
              erat eget eget. Sagittis aliquam orci feugiat vitae."
          filledSlots={12}
          totalSlots={23}
          location="123 ABC Street, Boston MA 12345"
          volunteers={volunteers}
          toggleSelect={toggleSelect}
        ></EventAdminTable>
        {/* Bottom spacer */}
        <div></div>
        </button>
        
      </div>
    </div>
    </div>
    </div>
  );
}

export default Home;
