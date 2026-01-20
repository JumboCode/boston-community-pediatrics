"use client";

import React from "react";
import {useState, useEffect} from "react";
import homepage from "@/assets/images/homepage.png";
import welcome from "@/assets/images/welcome.png";
import aboutus from "@/assets/images/aboutus.jpg";
import bcpmascot from "@/assets/images/bcpmascot.jpeg";
import box from "@/assets/images/box.jpeg";
import Image from "next/image";
import Button from "@/components/common/buttons/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Home: React.FC = () => {
  const router = useRouter();

  const [pinnedEvents, setPinnedEvents] = useState<any[]>([]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const BASE_WIDTH = 1440;
    const BASE_HEIGHT = 900;

    const handleResize = () => {
      const widthRatio = window.innerWidth / BASE_WIDTH;
      const heightRatio = window.innerHeight / BASE_HEIGHT;

      setScale(Math.min(widthRatio, heightRatio));
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  const fetchPinnedEvents = async () => {
    try {
      const res = await fetch("/api/events?pinned=true");
      const data = await res.json();
      setPinnedEvents(data);
    } catch (err) {
      console.error("Failed to load pinned events");
    }
  };

  fetchPinnedEvents();
}, []);


  return (
    <div className="min-h-screen flex bg-whiter elative w-full h-full flex flex-col items-center bg-white">
      <div className="relative w-full h-auto">
        <Image src={homepage} alt="Homepage Image" className="w-full" />
        

    
          <Image
            src={welcome}
            alt="Welcome Message"
            className="
            absolute 
            left-0 
            top-[40%] 
            origin-left"
            style={{ transform: `scale(${scale})` }}
          />
          
      
        <div 
            className="absolute left-1/2  top-[70%] origin-center transition-transform duration-150"
            style ={{ transform: `translateX(-50%) scale(${scale})`}}
        >
          <Button
            label="Volunteer"
            onClick={() => router.push("/event")}
            altStyle="w-[525px] h-[70px] text-white bg-[#234254] rounded-lg font-large flex items-center justify-center hover:bg-[#426982]"
          />
        </div>
      </div>
      <div className="flex items-center my-10 justify-center w-[90%] mx-auto">
        <div className="flex-grow border-t-2 border-[#234254]"></div>
        <span className="mx-4 text-[#234254] text-3xl font-bold">
          Featured Opportunities
        </span>
        <div className="flex-grow border-t-2 border-[#234254]"></div>
      </div>

      <div
  className="flex justify-center w-[90%]"
  style={{ gap: `${60 * scale}px` }} // base gap 60px, shrinks with scale
>
  {[bcpmascot, box].map((img, idx) => (
    <div
      key={idx}
      className="text-center text-[#234254] text-lg font-bold"
      style={{ transform: `scale(${scale})`, transition: 'transform 0.2s' }}
    >
      <div className="relative w-[450px] h-[400px] group">
        <Image
          src={img}
          alt={idx === 0 ? "Red Sox Event" : "Food Drive"}
          className="w-full h-full object-cover object-top drop-shadow-xl drop-shadow-[#234254] transition-all duration-300 group-hover:blur-[3px]"
        />
        <Button
          label="More Details"
          onClick={() => router.push("/event/[eventId]")}
          altStyle="absolute inset-0 w-[160px] h-[55px] text-white bg-[#234254] rounded-lg 
          flex items-center justify-center opacity-0 text-md font-normal
          transition-opacity duration-300 group-hover:opacity-100 top-[85%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:bg-[#426982]"
        />
      </div>
      <div className="mt-8">{idx === 0 ? "Red Sox Event" : "Food Drive"}</div>
    </div>
  ))}
</div>

      <div className="flex items-center my-10 justify-center w-[90%] mx-auto">
        <div className="flex-grow border-t-2 border-[#234254]"></div>
        <span className="mx-4 text-[#234254] text-3xl font-bold">About Us</span>
        <div className="flex-grow border-t-2 border-[#234254]"></div>
      </div>
      <div className="flex items-center my-5 justify-center w-[90%] mx-auto gap-20 mb-20">
        <div className="text-[#234254] text-lg font-normal w-[60%]">
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
        <div className="w-[40%] flex justify-center">
          <Image
            src={aboutus}
            alt="About Us Image"
            className="w-full h-full object-cover object-top drop-shadow-xl drop-shadow-[#234254]"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
