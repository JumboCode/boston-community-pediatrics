'use client';
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

  const handleClick = () => {
    console.log(`Button clicked!`);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      {/* Top spacer */}
      <div></div>
      
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
        </div>
      </div>
  );
}

export default Home;
