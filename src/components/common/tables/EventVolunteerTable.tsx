// Button component!
import React, { useState } from "react";

interface EventVolunteerTableProps {
  positionTitle: string;
  streetAddress: string;
  date: Date;
  description: string;
}

function EventVolunteerTable(props: EventVolunteerTableProps) {
  const {label, onClick} = prop
  console.log(count)

  return (
    <div >
      <button 
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        onClick={onClick}>
          {label}
        </button>
    </div>
  );
}

export default EventVolunteerTable