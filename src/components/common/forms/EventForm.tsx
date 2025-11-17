'use client';
import Image from "next/image";
import BackArrow from "@/assets/icons/arrow-left.svg";
import Link from "next/link";
import Button from "@/components/common/buttons/Button";
import { useState, useRef, ChangeEvent } from "react";
import Carousel from "../Carousel";
import type { StaticImageData } from "next/image";


const EventForm = () => {
    //const [posDateEqualsEvent, setPosDatetoEvent] = useState(false);
    //const [posTimeEqualsEvent, setPosTimetoEvent] = useState(false);

    
    //const toggleDate = () => setPosDatetoEvent(prev => !prev);
    //const toggleTime = () => setPosTimetoEvent(prev => !prev);
    const [positions, setPositions] = useState([
      { date: "", name: "", time: "", title: "", apt: "", city: "", state: "", address: "" , sameAsDate: false, sameAsTime: false, sameAsEvent: false},
    ]);
    
    const [carouselImages, setCarouselImages] = useState<StaticImageData[]>([]);

const fileInputRef = useRef<HTMLInputElement | null>(null);

const createStaticImageData = (url: string): StaticImageData => {
  return {
    src: url,
    height: 0,
    width: 0,
    blurDataURL: "",
    blurWidth: 0,
    blurHeight: 0,
  } as StaticImageData;
};

const handleAddPhotosClick = () => {
  fileInputRef.current?.click();
};

const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const newImages: StaticImageData[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = URL.createObjectURL(file); // preview URL
    newImages.push(createStaticImageData(url));
  }

  setCarouselImages((prev) => [...prev, ...newImages]);

  // Allow selecting the same file again later
  e.target.value = "";
};

  
    // Function to add a new position
    const addPosition = () => {
      setPositions((prevPositions) => [
        ...prevPositions,
        { date: "", name: "", time: "", title: "", apt: "", city: "", state: "", address: "", sameAsDate: false, sameAsTime: false, sameAsEvent: false },
      ]);
    };

    // Function to handle input changes for a specific position
    const handleInputChange = (index: number, field: string, value: string) => {
      const updatedPositions = positions.map((position, i) =>
        i === index ? { ...position, [field]: value } : position
      );
      setPositions(updatedPositions);
    };
    const toggleSameAsEvent = (index: number) => {
      const updatedPositions = positions.map((position, i) =>
        i === index ? { ...position, sameAsEvent: !position.sameAsEvent} : position
      );
      setPositions(updatedPositions);
    };
    const toggleSameAsDate = (index: number) => {
      const updatedPositions = positions.map((position, i) =>
        i === index ? { ...position, sameAsDate: !position.sameAsDate } : position
      );
      setPositions(updatedPositions);
    };
    const toggleSameAsTime = (index: number) => {
      const updatedPositions = positions.map((position, i) =>
        i === index ? { ...position, sameAsTime: !position.sameAsTime } : position
      );
      setPositions(updatedPositions);
    };

    return (
      <div className="flex flex-col items-center border border-[#6B6B6B] rounded-lg mt-[120px] mb-[138px] w-[792px] relative">
      {/* Back arrow */}
      <div className="w-full flex justify-start mt-[28px] pl-[30px] cursor-pointer">
        <Link href="/">
          <Image src={BackArrow} alt="Back arrow" className="w-[30.86px] h-[24px]" />
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-[#234254] text-[36px] font-medium mt-[22px] mb-6 text-center leading-tight">
        Create a new event
      </h1>
      {/* Carousel + Add photos */}
<div className="w-full flex flex-col items-center mb-16">
  <div className="flex justify-center scale-[0.588] origin-top">
    <Carousel images={carouselImages} />
  </div>

  {/* Hidden file input */}
  <input
    type="file"
    accept="image/*"
    multiple
    ref={fileInputRef}
    className="hidden"
    onChange={handleFilesSelected}
  />

  {/* Add photos button */}
  <Button
    label="+ Add photos"
    altStyle="bg-[#CAD1D4] text-[#000000] text-[16px] w-[160px] h-[40px] font-mrun devedium px-4 py-2 rounded-lg hover:bg-[#b9c0c3] mt-4"
    onClick={handleAddPhotosClick}
  />
</div>
        {/*<Button
          label="Create event"
          altStyle="bg-[#234254] text-[#FFFFFF] text-[16px] w-[125px] h-[44px] font-medium rounded-lg hover:bg-[#386a80]"
        />/*}


      {/* Form fields */}
      <div className="flex flex-col gap-10 mx-[102px]">
        {/* Event Title */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event title"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Event title
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Event Date */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="date"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Event date
          </label>
          <input
            id="event date"
            type="date"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* time */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="dob"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Event time
          </label>
          <input
            id="event time"
            type="time"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Street Address */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Event description
          </label>
          <input
            id="street"
            className="w-[588px] h-[175px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Street Address */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Street Address
          </label>
          <input
            id="street"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Apt/Suite */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="apt"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Apt, suite, etc
          </label>
          <input
            id="apt"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* City */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="city"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            City
          </label>
          <input
            id="city"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* State / Zip */}
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="state"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              State
            </label>
            <input
              id="state"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>

          <div className="flex flex-col items-start">
            <label
              htmlFor="zip"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              Zip code 
            </label>
            <input
              id="zip"
              inputMode="numeric"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>


        {positions.map((position, index) => (
  <div key={index} className="flex flex-col">
    
    {/* Position Name */}
    <div className="flex flex-col items-start">
      <label
        htmlFor={`position-name-${index}`}
        className="text-base font-normal text-[#6B6B6B] mb-1"
      >
        Position name
      </label>
      <input
        id={`position-name-${index}`}
        type="text"
        value={position.name}
        onChange={(e) => handleInputChange(index, "name", e.target.value)}
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />
    </div>

   
    {/* Position Date */}
<div className="flex flex-col ">
  {/* Top row: label on left, button + checkbox on right */}
  <div className="flex items-center justify-between">
    <label
      htmlFor={`position-date-${index}`}
      className="text-base font-normal text-[#6B6B6B] mb-1 mt-10"
    >
      Position date
    </label>
    <div className="flex items-center gap-2 mt-10">
      <Button
        label="Same as event"
        altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
        onClick={() => toggleSameAsDate(index)}
      />
      <input
        type="checkbox"
        checked={position.sameAsDate}
        onChange={() => toggleSameAsDate(index)}
        className="w-5 h-5 accent-[#234254] cursor-pointer"
      />
    </div>
  </div>

  {/* Input below */}
  <input
    id={`position-date-${index}`}
    type="date"
    value={position.date}
    onChange={(e) => handleInputChange(index, "date", e.target.value)}
    className="w-[588px] h-[43px] rounded-lg border p-3 text-base placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
  />
</div>


    {/* Position Time */}
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
      <label
        htmlFor={`position-time-${index}`}
        className="text-base font-normal text-[#6B6B6B] mb-1 mt-10"
      >
        Position time
      </label>
      <div className="flex items-center gap-2 mt-10">
      <Button
        label="Same as event"
        altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
        onClick={() => toggleSameAsTime(index)}
      />
      <input
        type="checkbox"
        checked={position.sameAsTime}
        onChange={() => toggleSameAsTime(index)}
        className="w-5 h-5 accent-[#234254] cursor-pointer"
      />
    </div>
  </div>
      <input
        id={`position-time-${index}`}
        type="time"
        value={position.time}
        onChange={(e) => handleInputChange(index, "time", e.target.value)}
        className="w-[588px] h-[43px] rounded-lg border p-3 text-base placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />
    </div>
  

    {/* Position Title */}
    <div className="flex flex-col">
      <label
        htmlFor={`position-title-${index}`}
        className="text-base font-normal text-[#6B6B6B] mb-1 mt-10"
      >
        Position description
      </label>
      <input
        id={`position-title-${index}`}
        type="text"
        value={position.title}
        onChange={(e) => handleInputChange(index, "title", e.target.value)}
        className="w-[588px] h-[175px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />
    </div>

    {/* Position Address */}
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
      <label
        htmlFor={`street-address-${index}`}
        className="text-base font-normal text-[#6B6B6B] mb-1 mt-10"
      >
        Street address
      </label>
      <div className="flex items-center gap-2 mt-10">
      <Button
        label="Same as event"
        altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
        onClick={() => toggleSameAsEvent(index)}
      />
      <input
        type="checkbox"
        checked={position.sameAsEvent}
        onChange={() => toggleSameAsEvent(index)}
        className="w-5 h-5 accent-[#234254] cursor-pointer"
      />
    </div>
  </div>
      <input
        id={`street-address-${index}`}
        type="address"
        value={position.address}
        onChange={(e) => handleInputChange(index, "address", e.target.value)}
        className="w-[588px] h-[43px] rounded-lg border p-3 text-base placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />
    </div>

    {/* Apt / Suite */}
    <div className="flex flex-col">
      <label
        htmlFor={`position-apt-${index}`}
        className="text-base font-normal text-[#6B6B6B] mb-1 mt-10"
      >
        Apt, suite, etc (optional)
      </label>
      <input
        id={`position-apt-${index}`}
        type="text"
        value={position.apt || ""}
        onChange={(e) => handleInputChange(index, "apt", e.target.value)}
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />
    </div>
  </div>
))}

        {/* Position name 
        <div className="flex flex-row gap-[60px]">
            <div className="flex flex-col items-start">
                <label
                    htmlFor="name"
                    className="text-base font-normal text-[#6B6B6B] mb-1"
                >
                    Position name
                </label>
                <input
                    id="position name"
                    type="name"
                    required
                    className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
                />
            </div>
        </div>

    {/* Position date 
    <div className="flex flex-col gap-2">
    {/* Top row: label on left, checkbox + text on right 
    <div className="flex items-center justify-between">
        <label
        htmlFor="position-date"
        className="text-base font-normal text-[#6B6B6B]"
        >
        Position date
        </label>

        <div className="flex items-center gap-2">
        <Button
            label="Same as event"
            altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
            //onClick={toggleDate}
            // onClick={handleCheckboxChange}
        />
        <input
            type="checkbox"
            //checked={posDateEqualsEvent}
            //onChange ={toggleDate}
            className="w-5 h-5 accent-[#234254] cursor-pointer"
        />
        </div>
    </div>

    {/* Date input below 
    <input
        id="position-date"
        type="date"
        required
        //disabled={posDateEqualsEvent}
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
    />
    </div>
    
        {/* Position time 
    <div className="flex flex-col gap-2">
    {/* Top row: label on left, checkbox + text on right 
    <div className="flex items-center justify-between">
        <label
        htmlFor="position-time"
        className="text-base font-normal text-[#6B6B6B]"
        >
        Position time
        </label>

        <div className="flex items-center gap-2">
        <Button
            label="Same as event"
            altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
            //onClick={toggleTime}
            // onClick={handleCheckboxChange}
        />
        <input
            type="checkbox"
            //checked={posTimeEqualsEvent}
            //onChange ={toggleTime}
            className="w-5 h-5 accent-[#234254] cursor-pointer"
        />
        </div>
    </div>

    {/* Date input below 
    <input
        id="position-time"
        type="time"
        required
        //disabled={posTimeEqualsEvent}
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
    />
    </div>
        
        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Position description
          </label>
          <input
            id="description"
            className="w-[588px] h-[175px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
         {/* Street Address 
    <div className="flex flex-col gap-2">
    {/* Top row: label on left, checkbox + text on right 
    <div className="flex items-center justify-between">
        <label
        htmlFor="position-street"
        className="text-base font-normal text-[#6B6B6B]"
        >
        Street Address
        </label>

        <div className="flex items-center gap-2">
        <Button
            label="Same as event"
            altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
            // onClick={handleCheckboxChange}
        />
        <input
            type="checkbox"
            className="w-5 h-5 accent-[#234254] cursor-pointer"
        />
        </div>
    </div>

    {/* Street input below *
    <input
        id="position-street"
        type="street"
        required
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
    />
    </div>

        {/* Apt/Suite 
        <div className="flex flex-col items-start">
          <label
            htmlFor="apt"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Apt, suite, etc
          </label>
          <input
            id="apt"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* City 
        <div className="flex flex-col items-start">
          <label
            htmlFor="city"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            City
          </label>
          <input
            id="city"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* State / Zip 
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="state"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              State
            </label>
            <input
              id="state"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>

          <div className="flex flex-col items-start">
            <label
              htmlFor="zip"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              Zip code 
            </label>
            <input
              id="zip"
              inputMode="numeric"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>
        <div className="flex flex-col items-start">
          <label
            htmlFor="participants"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Maximum number of participants
          </label>
          <input
            id="number of participants"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
      </div>

      {/* Button placeholder */}
      </div>
      <div className="flex flex-col items-center mt-[56px] mb-[56px]">
        <Button
            label="+ Add another position"
            altStyle="bg-[#CAD1D4] text-[#000000] text-[16px] w-[201px] h-[44px] font-medium px-4 py-2 rounded-lg hover:bg-[#b9c0c3]"
            onClick={addPosition}
        />
      </div>

      {/* Buttons at bottom of page - they don't do anything yet */}
      <div className="flex flex-col items-center mt-[56px] mb-[71px]">
        <div className="flex flex-row items-center">
          <Button
            label="Save as draft"
            altStyle="bg-[#FFFFFF] text-[#000000] text-[16px] w-[125px] h-[44px] font-medium rounded-lg hover:bg-[#f2f2f2] mr-[15px] border border-[#000000]"
          />
          <Button
            label="Create event"
            altStyle="bg-[#234254] text-[#FFFFFF] text-[16px] w-[125px] h-[44px] font-medium rounded-lg hover:bg-[#386a80] ml-[15px]"
          />
        </div>
      </div>      
    </div>
    );
};
export default EventForm;