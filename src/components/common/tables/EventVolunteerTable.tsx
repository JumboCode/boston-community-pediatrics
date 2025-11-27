import Image from "next/image";
import Button from "@/components/common/buttons/Button";
import defaultPfp from "@/assets/icons/empty-profile-picture.svg";
import { User } from "@prisma/client";
import { getUsersByPositionId } from "@/app/api/eventSignup/controller";
import type { PublicUser } from "@/app/api/eventSignup/controller";

interface EventVolunteerTableProps {
  positionTitle: string;
  streetAddress: string;
  startTime: string;
  endTime: string;
  date: string;
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
    date,
    description,
    totalSpots,
    filledSpots,
    positionId,
  } = props;

  let volunteers: PublicUser[] = [];
  let error: string | null = null;

  try {
    if (positionId) {
      volunteers = await getUsersByPositionId(positionId);
    }
  } catch (err) {
    console.error("Failed to load volunteers:", err);
    error = "Failed to load volunteers";
  }

  const volunteerNames = volunteers.map((v) => `${v.firstName} ${v.lastName}`);
  volunteerNames.push("Priyanka Onta");
  volunteerNames.push("Ava Sim");
  volunteerNames.push("Eddy Hernandez");
  volunteerNames.push("Julia Shen");

  return (
    <div
      className={`border border-gray-300 w-[800px] ml-[50px] mt-0 flex flex-row relative bg-[#FFFFFF] transition-all duration-300`}
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
        className={`border-l border-gray-300 w-[225px] relative transition-all duration-300 p-[20px]`}
      >
        <div className="text-[#234254] text-[20px] font-medium font-avenir text-right">
          {filledSpots} / {totalSpots}
        </div>

        {error && (
          <p className="text-red-500 text-right mt-2 text-sm">
            {"Failed to load volunteers"}
          </p>
        )}

        <div className="mt-[20px] space-y-[12px] max-h-[150px] overflow-y-auto pr-1">
          {volunteerNames.map((name, i) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventVolunteerTable;
