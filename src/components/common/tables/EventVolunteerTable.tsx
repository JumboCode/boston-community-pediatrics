import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/common/buttons/Button";
import defaultPfp from "@/assets/icons/empty-profile-picture.svg";
import useSWR from "swr";
import { User } from "@prisma/client";

interface EventVolunteerTableProps {
  positionTitle: string;
  streetAddress: string;
  startTime: string; //change to DateTime?
  endTime: string;
  date: string; // Change to dateTime?
  description: string;
  totalSpots: number;
  filledSpots: number;
  positionId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function EventVolunteerTable(props: EventVolunteerTableProps) {
  const {
    positionTitle,
    streetAddress,
    startTime,
    endTime,
    date,
    description,
    totalSpots,
    filledSpots,
    positionId,
  } = props;
  const [expanded, setExpanded] = useState(false);

  // Use SWR to fetch volunteers for this position
  const { data: volunteers, error } = useSWR(
    positionId ? `/api/eventSignup?positionId=${positionId}` : null,
    fetcher,
    {
      errorRetryCount: 1, // one retry
      errorRetryInterval: 5000, // wait 5s between retries
    }
  );

  const volunteerNames: string[] =
    volunteers?.map(
      (signup: User) =>
        signup.firstName + " " + signup.lastName || "Unknown User"
    ) || [];

  return (
    <div
      className={`border border-gray-300 w-[800px] ml-[50px] mt-0 flex flex-row relative bg-[#FFFFFF] transition-all duration-300 ${expanded ? "h-auto" : "h-[250px]"}`}
    >
      {/* Box 1 */}
      <div className="w-[575px] relative p-[20px]">
        <div className="text-[#234254] text-[20px] font-medium font-avenir leading-[1.25]">
          {positionTitle}
        </div>
        <div className="text-[#234254] text-[14px] font-normal font-avenir mt-[8px]">
          {streetAddress}
        </div>
        <div className="text-[#234254] text-[14px] font-normal font-avenir">
          {date}, {startTime} - {endTime}
        </div>

        <div className="mt-[12px] break-words text-[#234254] text-[14px] font-normal font-avenir leading-[1.4]">
          {description}
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
          {volunteerNames.length} / {totalSpots}
        </div>

        {error && (
          <p className="text-red-500 text-right mt-2 text-sm">
            {"Failed to load volunteers"}
          </p>
        )}

        <div className="mt-[20px] space-y-[12px]">
          {(expanded ? volunteerNames : volunteerNames.slice(0, 4)).map(
            (name, i) => (
              <div key={i} className="flex items-center gap-2 justify-end">
                <span className="text-[#234254] text-[15px] font-normal font-avenir">
                  {name}
                </span>

                <Image
                  width={28}
                  height={28}
                  src={defaultPfp.src}
                  alt="Profile"
                  className="rounded-full"
                />
              </div>
            )
          )}
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
