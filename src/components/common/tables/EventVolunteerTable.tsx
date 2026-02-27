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

  const volunteerNames = volunteers.map((v) => `${v.firstName} ${v.lastName}`);

  return (
    <div className="max-w-[1000px] flex ">
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

      <div
        className={`border-b border-gray-300 w-[250px] transition-all duration-300 p-[20px]`}
      >
        <div className="text-bcp-blue text-[22px] font-medium font-avenir text-right">
          {filledSpots}/{totalSpots} Spots Filled
        </div>

        {error && (
          <p className="text-red-500 text-right mt-2 text-sm">
            {"Failed to load volunteers"}
          </p>
        )}

        <div className="mt-[20px] space-y-[12px] overflow-y-auto pr-1">
          {volunteerNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2 justify-end">
              <span className="text-bcp-blue text-[15px] font-normal font-avenir">
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventVolunteerTable;
