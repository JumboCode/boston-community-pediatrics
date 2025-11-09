// Code for Event Admin Table
import React from "react";

//Some other parts of schema goes into these but those aren't relevant rn - Jeremiah
interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  selected: boolean;
}

//I know schema has a lot of other stuff, but a lot aren't used for table - Jeremiah
interface EventPosition {
  // id: string;
  position: string;
  // eventId: string;
  // date: Date;
  startTime: string; // either string or Date, chose string for simplicity - Jeremiah
  endTime: string; // same as above
  description: string;
  filledSlots: number;
  totalSlots: number;
  location: string; // I get that it uses lat and lng to look up, chose string for simplicity - Jeremiah
  // lat: number;
  // lng: number;

  volunteers: User[];
  toggleSelect: (id: string) => void;
}

const EventAdminTable: React.FC<EventPosition> = ({
  position,
  startTime,
  endTime,
  description,
  filledSlots,
  totalSlots,
  location,
  volunteers,
  toggleSelect,
}) => {
  // Check if at least one volunteer is selected
  const anySelected = volunteers.some((v) => v.selected);

  return (
    <div className="bg-white flex items-center justify-center p-6">
      <div className=" w-full w-[996px] bg-white border border-black font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start gap-10 mb-3 px-5 pt-5">
          {/* Left Section */}
          <div
            className="text-[#234254] flex-shrink-0"
            style={{ width: "280px" }}
          >
            <h1 className="text-[24px] font-semibold">{position}</h1>
            <p className="text-[16px] pt-2">{location}</p>
            <p className="text-[16px]">
              {startTime} - {endTime}
            </p>
            <p className="text-[24px] pt-5">
              {filledSlots}/{totalSlots} Spots Filled
            </p>
          </div>

          {/* Right Section */}
          <div className="text-[#234254] flex-1 flex flex-col justify-between mb-10">
            <p className="text-[16px] leading-[1.6] mb-5">{description}</p>
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-[#234254] h-4 rounded-full"
                style={{ width: `${(filledSlots / totalSlots) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Volunteer Table */}
        <table className="w-full border-white-700 text-[#234254]">
          <thead className="bg-white sticky top-0 z-10">
            <tr className="text-left">
              <th className="py-3 px-6 font-normal"></th>
              <th className="py-3 pl-29 px-4 font-normal">Name</th>
              <th className="py-3 px-4 font-normal">Email</th>
              <th className="py-3 px-4 font-normal">Phone Number</th>
              <th className="py-3 px-4 text-center font-normal">Select all</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((p, i) => (
              <tr
                key={p.id}
                className={`border-t border-gray-300 border-b transition-colors duration-200 ${
                  p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                }`}
              >
                <td className="py-3 px-6">{i + 1}</td>
                <td className="py-3 px-4 flex items-center gap-15">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  {p.firstName} {p.lastName}
                </td>
                <td className="py-3 px-4">{p.emailAddress}</td>
                <td className="py-3 px-4">{p.phoneNumber}</td>
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
            <div className="flex justify-between px-6 py-4">
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
};

export default EventAdminTable;
