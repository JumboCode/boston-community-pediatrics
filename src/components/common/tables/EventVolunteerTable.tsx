import Image from "next/image";
import defaultPfp from "@/assets/icons/empty-profile-picture.svg";
import { getUsersByPositionId } from "@/app/api/eventSignup/controller";
import type { PublicUser } from "@/app/api/eventSignup/controller";
import RegisterButton from "../buttons/RegisterButton";

interface EventVolunteerTableProps {
  positionTitle: string;
  streetAddress: string;
  startTime: string;
  endTime: string;
  description: string;
  totalSpots: number;
  filledSpots: number;
  positionId: string;
}

async function EventVolunteerTable(props: EventVolunteerTableProps) {
  const {
    positionTitle,
    streetAddress,
    startTime,
    endTime,
    description,
    totalSpots,
    filledSpots,
    positionId,
  } = props;

  let volunteers: PublicUser[] = [];
  let error: string | null = null;

  try {
    if (positionId) {
      volunteers = await getUsersByPositionId(positionId, false);
    }
  } catch (err) {
    console.error("Failed to load volunteers:", err);
    error = "Failed to load volunteers";
  }

  return (
    <div className="max-w-[1000px] flex">
      <div className="w-[750px] relative p-[20px] border-b border-r border-gray-300">
        <div className="text-bcp-blue text-[22px] font-medium font-avenir leading-[1.25]">
          {positionTitle}
        </div>
        <div className="text-bcp-blue text-[14px] font-bold font-avenir mt-[8px]">
          {streetAddress}
        </div>
        <div className="text-bcp-blue text-[14px] font-normal font-avenir">
          <p className="text-[14px]">
            {new Date(startTime).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
            {", "}
            {new Date(startTime).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}{" "}
            -{" "}
            {new Date(endTime).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
        <div className="mt-[12px] break-words text-bcp-blue text-[14px] font-normal font-avenir leading-[1.4]">
          {description}
        </div>
        <RegisterButton positionId={positionId}></RegisterButton>
      </div>

      <div className="border-b border-gray-300 w-[250px] p-[20px]">
        <div className="text-bcp-blue text-[22px] font-medium font-avenir text-right">
          {filledSpots}/{totalSpots} Spots Filled
        </div>

        {error && (
          <p className="text-red-500 text-right mt-2 text-sm">
            Failed to load volunteers
          </p>
        )}

        <div className="mt-[20px] space-y-[12px] pr-1">
          {volunteers.map((volunteer) => (
            <div key={volunteer.signupId}>
              {/* Main volunteer row */}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-bcp-blue text-[15px] font-normal font-avenir">
                  {volunteer.firstName} {volunteer.lastName}
                </span>
                <Image
                  width={28}
                  height={28}
                  src={defaultPfp.src}
                  alt="Profile"
                  className="rounded-full"
                />
              </div>

              {/* Guest rows: names on left, curved stem on right under avatar */}
              {volunteer.guests && volunteer.guests.length > 0 && (
                <div className="flex mt-[4px]">
                  {/* Guest names — fill remaining space, right-align text */}
                  <div className="flex flex-col flex-1" style={{ marginRight: 8 }}>
                    {volunteer.guests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center justify-end"
                        style={{ height: 36 }}
                      >
                        <span className="text-bcp-blue text-[15px] font-normal font-avenir">
                          {guest.firstName} {guest.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Stem column — fixed 28px wide, sits directly under avatar */}
                  <div className="flex flex-col" style={{ width: 28, marginTop: -8 }}>
                    {volunteer.guests.map((guest, gIdx) => {
                      const isLast = gIdx === volunteer.guests.length - 1;
                      return (
                        <svg
                          key={guest.id}
                          width="28"
                          height="36"
                          viewBox="0 0 28 36"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Vertical stem down center of avatar column */}
                          <line
                            x1="14" y1="0"
                            x2="14" y2={isLast ? "18" : "36"}
                            stroke="#D9D9D9"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          {/* Curved branch going left toward the name */}
                          <path
                            d="M14 18 Q14 28 2 28"
                            stroke="#D9D9D9"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventVolunteerTable;