import React from "react";
// import EventAdminTable from "@components/common/tables/EventAdminTable";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      {/* Top spacer */}
      <div></div>

      {/* Main content */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold animate-bounce">
          Welcome to BCP!
        </h1>
        <p className="text-xl text-white/90">
          Your go-to platform for managing volunteers, events, and more.
        </p>
        <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all">
          Get Started
        </button>
      </div>



      <div className="w-[996px] h-[735px] p-6 bg-white rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="md:w-1/2 space-y-2">
            <h2 className="text-[24px] text-gray-500 font-semibold">
              Position Name
            </h2>
            <p className="text-[16px] text-gray-500">
              123 ABC Street, Boston, MA, 12345
            </p>
            <p className="text-[16px] text-gray-500">10:00AM - 3:00PM</p>
            <p className="text-[24px] text-gray-500">12/23 Spots Filled</p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#234254] bg-500 h-3 rounded-full"
              style={{ width: `${(75/100) * 100}%` }}
            ></div>
          </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:w-1/2 text-[16px] text-gray-600 leading-relaxed">
          Lorem ipsum dolor sit amet consectetur. Neque tellus bibendum etiam
          purus volutpat amet faucibus nibh nunc. Lacus quam pretium vitae
          dignissim. Nibh et tempus venenatis scelerisque enim egestas
          vestibulum tempor. Aliquam sit pretium tellus at molestie diam erat
          eget eget. Sagittis aliquam orci feugiat vitae. `
        </div>
      </div>

      

      {/* Bottom spacer */}
      <div></div>
    </div>
  );
}
