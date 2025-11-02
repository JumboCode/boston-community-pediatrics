// Code for Event Admin Table
import React from "react";

interface EventAdminProps {
  positionName: string;
  positionDescription: string;
  volunteersSignedUp: number;
  totalVolunteersNeeded: number;
  checkAll: boolean;
  volunteers: {
    name: string;
    phone: string;
    email: string;
    checkbox: boolean;
  }[];
}

  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      className="bg-[#234254] bg-500 h-3 rounded-full"
      style={{ width: `${(volunteersSignedUp/totalVolunteersNeeded) * 100}%` }}
    ></div>
  </div>



const EventAdminTable: React.FC<EventAdminProps> = ({
  positionName,
  positionDescription,
  volunteersSignedUp = 12,
  totalVolunteersNeeded = 23,
  checkAll,
  volunteers,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="space-y-2">
          <h2 className="text-[24px] text-gray-500 font-semibold">{positionName}</h2>
          <p className="text-[16px] text-gray-500">123 ABC Street, Boston, MA, 12345</p>
          <p className="text-[16px] text-gray-500">10:00AM - 3:00PM</p>
          <p className="text-[24px] text-gray-500">{volunteersSignedUp/totalVolunteersNeeded} Spots Filled</p>
        </div>
      </div>
      <div className="mt-4 md:mt-0 md:w-1/2 text-[24px] text-gray-600 leading-relaxed">
        {positionDescription}
      </div>
    </div>
  );
};
