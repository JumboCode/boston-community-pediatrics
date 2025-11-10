import React, { useState } from "react";
import Image from "next/image";
import Button from "@/components/common/buttons/Button";
import defaultPfp from "@/assets/icons/defaultPfp.svg";

interface EventVolunteerTableProps {
  positionTitle: string;
  streetAddress: string;
  startTime: string; //change to DateTime? 
  endTime: string;
  date: string; // Change to dateTime? 
  description: string;
  totalSpots: number;
  filledSpots: number;
}

function EventVolunteerTable(props: EventVolunteerTableProps) {
  const { positionTitle, streetAddress, startTime, endTime, date, description, 
          totalSpots, filledSpots} = props;
  const [expanded, setExpanded] = useState(false);

  const signups = Array.from({ length: 23 }, (_, i) => `First Last`);

  return (
    <div
      className={`border border-gray-300 w-[800px] ml-[50px] mt-0 flex flex-row relative bg-[#FFFFFF] transition-all duration-300 ${expanded ? "h-auto" : "h-[250px]"}`}
    >
      {/* Box 1 */}
      <div className="w-[575px] h-[250px] relative p-[20px]">
        <div className="text-[#234254] text-[20px] font-medium font-avenir leading-[1.25]">
          {positionTitle}
        </div>
        <div className="text-[#234254] text-[14px] font-normal font-avenir mt-[8px]">
          {streetAddress}
        </div>
        <div className="text-[#234254] text-[14px] font-normal font-avenir">
          {date}, {startTime} - {endTime}
        </div>

        <div className="mt-[12px] text-[#234254] text-[14px] font-normal font-avenir leading-[1.4]">
          Lorem ipsum dolor sit amet consectetur. Neque tellus bibendum etiam
          purus volutpat amet faucibus nibh nunc. Lacus quam pretium vitae
          dignissim. Nibh et tempus venenatis scelerisque enim egestas
          vestibulum tempor.
        </div>

        <Button
          label="Register"
          onClick={() => alert("Button clicked!")}
          altStyle="w-[94px] h-[40px] mt-[12px] text-white bg-[#426982] rounded font-medium flex items-center justify-center hover:bg-[#426982]"
        />
      </div>

      {/* Box 2 */}
      <div
        className={`border-l border-gray-300 w-[225px] relative transition-all duration-300 p-[20px] ${expanded ? "h-auto" : "h-[250px]"}`}
      >
        <div className="text-[#234254] text-[20px] font-medium font-avenir text-right">
          12/23 Spots Filled
        </div>

        <div className="mt-[20px] space-y-[12px]">
          {(expanded ? signups : signups.slice(0, 4)).map((name, i) => (
            <div key={i} className="flex items-center gap-2 justify-end">
              <span className="text-[#234254] text-[15px] font-normal font-avenir">
                {name}
              </span>

              <Image
                src={defaultPfp.src}
                alt="Profile"
                className="w-[28px] h-[28px] rounded-full"
              />
            </div>
          ))}
        </div>

        <div
          className={`text-[#234254] text-[14px] font-normal font-avenir text-right cursor-pointer hover:underline ${expanded ? "mt-[20px]" : "absolute bottom-[10px] right-[20px]"}`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "View less" : "View more"}
        </div>
      </div>
    </div>
  );
}

export default EventVolunteerTable;
