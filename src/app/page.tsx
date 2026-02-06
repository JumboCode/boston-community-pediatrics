"use client";

import React from "react";
import { useState, useEffect } from "react";
import homepage from "@/assets/images/homepage.png";
import welcome from "@/assets/images/welcome.png";
import aboutus from "@/assets/images/aboutus.jpg";
import Image from "next/image";
import Button from "@/components/common/buttons/Button";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  name: string;
  date: Date[];
  startTime: Date;
  addressLine1: string;
  pinned: boolean;
  images: string[];
}

const Home: React.FC = () => {
  const router = useRouter();

  const [pinnedEvents, setPinnedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchPinnedEvents = async () => {
      try {
        const res = await fetch("/api/events/pinned");
        const data = await res.json();
        setPinnedEvents(data);
      } catch (err) {
        console.error("Failed to load pinned events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedEvents();
  }, []);

  useEffect(() => {
    const BASE_WIDTH = 1440;
    const BASE_HEIGHT = 900;
    const MOBILE_BREAKPOINT = 900;

    const handleResize = () => {
      const widthRatio = window.innerWidth / BASE_WIDTH;
      const heightRatio = window.innerHeight / BASE_HEIGHT;

      const MAX_SCALE = 1.5;

      const newScale = Math.min(widthRatio, heightRatio, MAX_SCALE);
      setScale(newScale);
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

      console.log("Window size:", window.innerWidth, "x", window.innerHeight);
      console.log("Scale:", newScale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-white relative w-full h-full flex flex-col items-center">
      <div className="relative w-full h-auto">
        <Image src={homepage} alt="Homepage Image" className="w-full" />

        <Image
          src={welcome}
          alt="Welcome Message"
          className="absolute left-0 top-[40%] origin-left"
          style={{ transform: `scale(${scale})` }}
        />

        <div
          className="absolute left-1/2 top-[70%] origin-center transition-transform duration-150"
          style={{ transform: `translateX(-50%) scale(${scale})` }}
        >
          <Button
            label="Volunteer"
            onClick={() => router.push("/event")}
            altStyle="w-[525px] h-[70px] text-white bg-bcp-blue rounded-lg font-large flex items-center justify-center hover:bg-light-bcp-blue"
          />
        </div>
      </div>

      <div className="flex items-center my-10 justify-center w-[90%] mx-auto">
        <div className="flex-grow border-t-2 border-bcp-blue"></div>
        <span className="mx-4 text-bcp-blue text-3xl font-bold">
          Featured Opportunities
        </span>
        <div className="flex-grow border-t-2 border-bcp-blue"></div>
      </div>

      <div
        className={`flex justify-center ${isMobile ? "flex-col items-center" : "origin-center"}`}
        style={{
          gap: isMobile ? "40px" : `${315 * scale}px`,
          width: isMobile ? "90%" : "auto",
          maxWidth: "100%",
          transition: "gap 0.5s",
        }}
      >
        {loading ? (
          <p className="text-bcp-blue text-lg">Loading events...</p>
        ) : pinnedEvents.length === 0 ? (
          <p className="text-bcp-blue text-lg">
            No featured events at this time.
          </p>
        ) : (
          pinnedEvents.map((event) => {
            const hasValidImage =
              event.images &&
              event.images.length > 0 &&
              event.images[0] &&
              event.images[0].trim() !== "";

            const imageSrc = hasValidImage
              ? event.images[0].startsWith("/")
                ? event.images[0]
                : `/${event.images[0]}`
              : "/event1.jpg";

            return (
              <div
                key={event.id}
                className="text-center text-bcp-blue text-lg font-bold"
              >
                <div
                  className={`relative group ${isMobile ? "w-[337px] h-[300px]" : ""}`}
                  style={
                    isMobile
                      ? {}
                      : {
                          width: `${486 * scale}px`,
                          height: `${391 * scale}px`,
                        }
                  }
                >
                  <Image
                    src={imageSrc}
                    alt={event.name}
                    width={450}
                    height={400}
                    className="w-full h-full object-cover object-top drop-shadow-xl drop-shadow-bcp-blue transition-all duration-300 group-hover:blur-[3px]"
                  />
                  <Button
                    label="More Details"
                    onClick={() => router.push(`/event/${event.id}`)}
                    altStyle="absolute inset-0 w-[160px] h-[55px] text-white bg-bcp-blue rounded-lg 
        flex items-center justify-center opacity-0 text-md font-normal
        transition-opacity duration-300 group-hover:opacity-100 top-[85%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:bg-light-bcp-blue"
                  />
                </div>
                <div className="mt-8">{event.name}</div>
              </div>
            );
          })
        )}
      </div>

      <div
        className="flex items-center justify-center w-[90%] mx-auto"
        style={{
          marginTop: `${32}px`,
          marginBottom: `${40 * Math.pow(scale, 0.8)}px`,
        }}
      >
        <div className="flex-grow border-t-2 border-bcp-blue"></div>
        <span className="mx-4 text-bcp-blue text-3xl font-bold">About Us</span>
        <div className="flex-grow border-t-2 border-bcp-blue"></div>
      </div>

      <div
        className={`flex items-center my-5 justify-center w-[90%] mx-auto mb-20 ${isMobile ? "flex-col gap-8" : "gap-20"}`}
      >
        <div
          className={`text-bcp-blue text-lg font-normal ${isMobile ? "w-full order-2" : "w-[60%]"}`}
        >
          <b>Lorem ipsum dolor</b> sit amet consectetur. At leo auctor nam metus
          tincidunt phasellus volutpat id pulvinar. Accumsan amet id pulvinar
          pellentesque sed vivamus ac. Id tortor sodales est aliquet nec
          volutpat. Phasellus massa erat a nunc risus consequat sed. Porta nunc
          convallis ultricies elit est cursus felis lacus consectetur. Rhoncus
          quis quisque egestas porta sit. Mauris aliquam eget imperdiet
          pellentesque. Nullam tristique arcu sit in in nulla viverra. Egestas
          euismod platea pretium augue aliquam aliquam ac feugiat. Vulputate
          massa gravida dui massa mi tellus sed. Vitae dui tincidunt a elementum
          turpis nisl lobortis vulputate aliquam. Morbi tristique risus ornare
          ridiculus massa vitae lacus a risus. Viverra lacus integer magna eget
          facilisis nunc. Lobortis porttitor tempus est orci adipiscing nisl. A
          parturient tellus nisi praesent posuere gravida sed. Aliquam elementum
          nec id ipsum sit orci quis sem neque.
        </div>
        <div
          className={`flex justify-center ${isMobile ? "w-full order-1" : "w-[40%]"}`}
        >
          <Image
            src={aboutus}
            alt="About Us Image"
            className="w-full h-full object-cover object-top drop-shadow-xl drop-shadow-bcp-blue"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
