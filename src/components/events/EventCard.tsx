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
}

const EventCard = (props: EventCardProps) => {
  const { image, title, time, location, date, id } = props;
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
      className="flex flex-col w-72 rounded-2xl shadow p-4 gap-2"
      href={`/event/${id}`}
    >
      <Image
        src={image}
        alt={title}
        width={600}
        height={600}
        className="w-full h-40 object-cover rounded-xl"
      />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm">{formattedTime}</p>
      <p className="text-sm">{location}</p>
      <p className="text-sm">{formattedDate}</p>
    </Link>
  );
};

export default EventCard;
