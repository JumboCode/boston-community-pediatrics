import Image from "next/image";
import Link from "next/link";

// EventCard Component
interface EventCardProps {
  image: string;
  title: string;
  time: Date;
  location: string;
  date: Date;
  id: string;
  currentSignups: number;
  maxSignups: number;
}

const EventCard = (props: EventCardProps) => {
  const { image, title, time, location, date, id, currentSignups, maxSignups } = props;
  // Format time to EST in readable format
  const formattedTime = new Date(time).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
  return (
    <Link
      className="flex flex-col w-[282px] mb-[35px]"
      href={`/event/${id}`}
    >
      <Image
        src={image}
        alt={title}
        width={600}
        height={600}
        className="w-full h-[167.53px] object-cover"
      />
      <div className="relative mt-[24px] pb-[18px]">
        <h3 className="text-[20px] font-bold">{title}</h3>
        <p className="text-[16px] mt-[15px]">{formattedTime}</p>
        <p className="text-[16px] mt-[4.86px]">{location}</p>
        <p className="text-[16px] mt-[4.86px]">{formattedDate}</p>

        <p className="absolute bottom-0 right-[6px] text-[16px] ">{currentSignups}/{maxSignups} sign ups</p>
      </div>
    </Link>
  );
};

export default EventCard;
