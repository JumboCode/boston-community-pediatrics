import Carousel from "@/components/common/Carousel";

import image6 from "@/assets/images/image6.jpg";
import image5 from "@/assets/images/image5.jpg";
import image4 from "@/assets/images/image4.jpg";
import image3 from "@/assets/images/image3.jpg";
import image2 from "@/assets/images/image2.jpg";
import image1 from "@/assets/images/image1.jpg";

export default function EventDetailsPage() {
  const event = {
    name: "JumboCode Event",
    date: "October 12-14, 2025",
    location: "123 ABC Street, Boston MA 12345",
    description:
      "Lorem ipsum dolor sit amet consectetur. Neque tellus bibendum etiam purus volutpat amet faucibus nibh nunc. Lacus quam pretium vitae dignissim. Nibh et tempus venenatis scelerisque enim egestas vestibulum tempor. Aliquam sit pretium tellus at molestie diam erat eget eget. Sagittis aliquam orci feugiat vitae. Sed a lectus porttitor mattis cursus viverra ut nisl mauris. Vitae faucibus ultrices volutpat fringilla in commodo. Massa augue malesuada consequat ac.",
    images: [image1, image2, image3, image4, image5, image6],
  };

  return (
    <main className="min-h-screen pt-16 pb-24 flex flex-col items-center">
      {/* Carousel at the top */}
      <Carousel images={event.images} />

      {/* Event details */}
      <section className="w-[1000px] mt-[56px]">
        <h1 className="text-[#234254] text-[36px] leading-[44px]">
          {event.name}
        </h1>
        <p className="mt-[8px] text-[#234254] text-[24px] leading-[32px]">
          {event.date}
        </p>
        <p className="mt-[8px] text-[#234254] text-[16px] leading-[24px]">
          {event.location}
        </p>
        <p className="mt-[32px] text-[#234254] text-[16px] leading-[24px]">
          {event.description}
        </p>
      </section>
    </main>
  );
}