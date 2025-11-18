"use client";
import { eventSchema } from "@/lib/schemas/eventSchema";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState, useRef, type ChangeEvent } from "react";
import BackArrow from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/buttons/Button";
import Carousel from "../Carousel";

const createStaticImageData = (url: string): StaticImageData =>
  ({
    src: url,
    height: 0,
    width: 0,
    blurDataURL: "",
    blurWidth: 0,
    blurHeight: 0,
  }) as StaticImageData;
const EventForm = () => {
  const [event, setEvent] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    resourcesLink: "",
    address: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
  });
  const [positions, setPositions] = useState([
    {
      name: "",
      date: "",
      time: "",
      description: "",
      address: "",
      apt: "",
      city: "",
      state: "",
      zip: "",
      participants: "",
      sameAsDate: false,
      sameAsTime: false,
      sameAsAddress: false,
    },
  ]);
  const [carouselImages, setCarouselImages] = useState<StaticImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleAddPhotosClick = () => fileInputRef.current?.click();
  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: StaticImageData[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newImages.push(createStaticImageData(url));
    }
    setCarouselImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };
  const addPosition = () =>
    setPositions((prev) => [
      ...prev,
      {
        name: "",
        date: "",
        time: "",
        description: "",
        address: "",
        apt: "",
        city: "",
        state: "",
        zip: "",
        participants: "",
        sameAsDate: false,
        sameAsTime: false,
        sameAsAddress: false,
      },
    ]);
  const removePosition = () =>
    setPositions((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const handlePositionChange = (
    index: number,
    field: string,
    value: string | boolean
  ) =>
    setPositions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  const toggleSameAsDate = (index: number) =>
    handlePositionChange(index, "sameAsDate", !positions[index].sameAsDate);
  const toggleSameAsTime = (index: number) =>
    handlePositionChange(index, "sameAsTime", !positions[index].sameAsTime);
  const toggleSameAsAddress = (index: number) =>
    handlePositionChange(
      index,
      "sameAsAddress",
      !positions[index].sameAsAddress
    );

  const handleCreateEvent = () => {
    // Normalize positions
    const normalizedPositions = positions.map((p) => ({
      ...p,
      date: p.sameAsDate ? event.date : p.date,
      time: p.sameAsTime ? event.time : p.time,
      address: p.sameAsAddress ? event.address : p.address,
      apt: p.sameAsAddress ? event.apt : p.apt,
      city: p.sameAsAddress ? event.city : p.city,
      state: p.sameAsAddress ? event.state : p.state,
      zip: p.sameAsAddress ? event.zip : p.zip,
    }));

    const formData = {
      ...event,
      positions: normalizedPositions,
    };

    const parseResult = eventSchema.safeParse(formData);

    if (!parseResult.success) {
      parseResult.error.issues.forEach((issue) => {
        console.error(issue.path.join("."), issue.message);
      });
      alert("Please fix the errors in the form");
      return;
    }

    // form is valid — send to API
    console.log("Validated event data:", parseResult.data);
  };

  return (
    <div className="relative mt-[120px] mb-[138px] flex w-[792px] flex-col items-center rounded-lg border border-[#6B6B6B] bg-white">
      {/* back arrow */}
      <div className="mt-[28px] flex w-full justify-start pl-[30px]">
        <Link href="/" className="cursor-pointer">
          <Image
            src={BackArrow}
            alt="Back arrow"
            className="h-[24px] w-[30.86px]"
          />
        </Link>
      </div>
      {/* title */}
      <h1 className="mt-[22px] text-center text-[36px] font-medium leading-tight text-[#234254]">
        Create a new event
      </h1>
      {/* carousel and add photos */}
      <div className="flex w-full flex-col items-center">
        <div className="mt-[26px] flex h-[212px] justify-center origin-top scale-[0.588]">
          <Carousel images={carouselImages} />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
        <div className="mt-[61px] mb-[24px]">
          <Button
            label="Add photos"
            altStyle="bg-[#234254] text-[#FFFFFF] text-[16px] w-[118px] h-[44px] rounded-lg hover:bg-[#386a80]"
            onClick={handleAddPhotosClick}
          />
        </div>
      </div>

      {/* event form fields */}
      <div className="mx-[102px] flex flex-col">
        {/* event title */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-title"
            className="mt-[24px] mb-1 text-base font-normal text-[#6B6B6B]"
          >
            Event title
          </label>
          <input
            id="event-title"
            type="text"
            value={event.title}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* event date */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-date"
            className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
          >
            Event date
          </label>
          <input
            id="event-date"
            type="date"
            value={event.date}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* event time */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-time"
            className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
          >
            Event time
          </label>
          <input
            id="event-time"
            type="time"
            value={event.time}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, time: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* event description */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-description"
            className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
          >
            Event description
          </label>
          <textarea
            id="event-description"
            value={event.description}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-[588px] h-[175px] resize-none rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* link to resources */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-resources"
            className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
          >
            Link to resources (optional)
          </label>
          <input
            id="event-resources"
            type="url"
            value={event.resourcesLink}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, resourcesLink: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* event street */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-street"
            className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
          >
            Street address
          </label>
          <input
            id="event-street"
            value={event.address}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, address: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* event apt */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-apt"
            className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
          >
            Apt, suite, etc (optional)
          </label>
          <input
            id="event-apt"
            value={event.apt}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, apt: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* event city */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-city"
            className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
          >
            City
          </label>
          <input
            id="event-city"
            value={event.city}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, city: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
        {/* event state / zip */}
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="event-state"
              className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
            >
              State
            </label>
            <input
              id="event-state"
              value={event.state}
              onChange={(e) =>
                setEvent((prev) => ({ ...prev, state: e.target.value }))
              }
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
          <div className="flex flex-col items-start">
            <label
              htmlFor="event-zip"
              className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]"
            >
              Zip code
            </label>
            <input
              id="event-zip"
              inputMode="numeric"
              value={event.zip}
              onChange={(e) =>
                setEvent((prev) => ({ ...prev, zip: e.target.value }))
              }
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>

        {/* Positions */}
        {positions.map((position, index) => (
          <div key={index} className="flex flex-col">
            {/* horizontal line */}
            <div className="mt-[40px] mb-[40px] w-full border-t border-[#D7D7D7]" />
            {/* position name */}
            <div className="flex flex-col items-start">
              <label
                htmlFor={`position-name-${index}`}
                className="mb-1 text-[16px] text-base font-normal text-[#6B6B6B]"
              >
                Position name
              </label>
              <input
                id={`position-name-${index}`}
                type="text"
                value={position.name}
                onChange={(e) =>
                  handlePositionChange(index, "name", e.target.value)
                }
                className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
              />
            </div>
            {/* position date */}
            <div className="flex flex-col">
              <div className="mt-10 flex items-center justify-between">
                <label
                  htmlFor={`position-date-${index}`}
                  className="mb-1 text-base font-normal text-[#6B6B6B]"
                >
                  Position date
                </label>
                <div className="mt-10 flex items-center gap-2">
                  <Button
                    label="Same as event"
                    altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
                    onClick={() => toggleSameAsDate(index)}
                  />
                  <input
                    type="checkbox"
                    checked={position.sameAsDate}
                    onChange={() => toggleSameAsDate(index)}
                    className="h-5 w-5 cursor-pointer accent-[#234254]"
                  />
                </div>
              </div>
              <input
                id={`position-date-${index}`}
                type="date"
                value={position.sameAsDate ? event.date : position.date}
                disabled={position.sameAsDate}
                onChange={(e) =>
                  handlePositionChange(index, "date", e.target.value)
                }
                className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
              />
            </div>
            {/* position time */}
            <div className="flex flex-col">
              <div className="mt-10 flex items-center justify-between">
                <label
                  htmlFor={`position-time-${index}`}
                  className="mb-1 text-base font-normal text-[#6B6B6B]"
                >
                  Position time
                </label>
                <div className="mt-10 flex items-center gap-2">
                  <Button
                    label="Same as event"
                    altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
                    onClick={() => toggleSameAsTime(index)}
                  />
                  <input
                    type="checkbox"
                    checked={position.sameAsTime}
                    onChange={() => toggleSameAsTime(index)}
                    className="h-5 w-5 cursor-pointer accent-[#234254]"
                  />
                </div>
              </div>
              <input
                id={`position-time-${index}`}
                type="time"
                value={position.sameAsTime ? event.time : position.time}
                disabled={position.sameAsTime}
                onChange={(e) =>
                  handlePositionChange(index, "time", e.target.value)
                }
                className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
              />
            </div>
            {/* position description */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-description-${index}`}
                className="mb-1 mt-10 text-base font-normal text-[#6B6B6B]"
              >
                Position description
              </label>
              <textarea
                id={`position-description-${index}`}
                value={position.description}
                onChange={(e) =>
                  handlePositionChange(index, "description", e.target.value)
                }
                className="w-[588px] h-[175px] resize-none rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
              />
            </div>
            {/* position street */}
            <div className="flex flex-col">
              <div className="mt-10 flex items-center justify-between">
                <label
                  htmlFor={`position-street-${index}`}
                  className="mb-1 text-base font-normal text-[#6B6B6B]"
                >
                  Street address
                </label>
                <div className="mt-10 flex items-center gap-2">
                  <Button
                    label="Same as event"
                    altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
                    onClick={() => toggleSameAsAddress(index)}
                  />
                  <input
                    type="checkbox"
                    checked={position.sameAsAddress}
                    onChange={() => toggleSameAsAddress(index)}
                    className="h-5 w-5 cursor-pointer accent-[#234254]"
                  />
                </div>
              </div>
              <input
                id={`position-street-${index}`}
                type="text"
                value={
                  position.sameAsAddress ? event.address : position.address
                }
                disabled={position.sameAsAddress}
                onChange={(e) =>
                  handlePositionChange(index, "address", e.target.value)
                }
                className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
              />
            </div>
            {/* position apt */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-apt-${index}`}
                className="mb-1 mt-10 text-base font-normal text-[#6B6B6B]"
              >
                Apt, suite, etc (optional)
              </label>
              <input
                id={`position-apt-${index}`}
                type="text"
                value={position.sameAsAddress ? event.apt : position.apt}
                disabled={position.sameAsAddress}
                onChange={(e) =>
                  handlePositionChange(index, "apt", e.target.value)
                }
                className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
              />
            </div>
            {/* position city */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-city-${index}`}
                className="mb-1 mt-10 text-base font-normal text-[#6B6B6B]"
              >
                City
              </label>
              <input
                id={`position-city-${index}`}
                type="text"
                value={position.sameAsAddress ? event.city : position.city}
                disabled={position.sameAsAddress}
                onChange={(e) =>
                  handlePositionChange(index, "city", e.target.value)
                }
                className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
              />
            </div>
            {/* position state / zip */}
            <div className="flex flex-row gap-[60px]">
              <div className="flex flex-col items-start">
                <label
                  htmlFor={`position-state-${index}`}
                  className="mb-1 mt-10 text-base font-normal text-[#6B6B6B]"
                >
                  State
                </label>
                <input
                  id={`position-state-${index}`}
                  type="text"
                  value={position.sameAsAddress ? event.state : position.state}
                  disabled={position.sameAsAddress}
                  onChange={(e) =>
                    handlePositionChange(index, "state", e.target.value)
                  }
                  className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col items-start">
                <label
                  htmlFor={`position-zip-${index}`}
                  className="mb-1 mt-10 text-base font-normal text-[#6B6B6B]"
                >
                  Zip code
                </label>
                <input
                  id={`position-zip-${index}`}
                  type="text"
                  value={position.sameAsAddress ? event.zip : position.zip}
                  disabled={position.sameAsAddress}
                  onChange={(e) =>
                    handlePositionChange(index, "zip", e.target.value)
                  }
                  className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
                />
              </div>
            </div>
            {/* max participants */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-participants-${index}`}
                className="mb-1 mt-10 text-base font-normal text-[#6B6B6B]"
              >
                Maximum number of participants
              </label>
              <input
                id={`position-participants-${index}`}
                type="number"
                value={position.participants}
                onChange={(e) =>
                  handlePositionChange(index, "participants", e.target.value)
                }
                className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* position buttons */}
      <div className="mt-[56px] mb-[71px] flex flex-col items-center">
        <div className="flex flex-row items-center">
          <Button
            label="Remove position"
            altStyle="bg-[#FFFFFF] text-[#234254] text-[16px] w-[153px] h-[44px] font-medium rounded-lg hover:bg-[#f2f2f2] mr-[11px]"
            onClick={removePosition}
          />
          <Button
            label="+ Add another position"
            altStyle="bg-[#CAD1D4] text-[#000000] text-[16px] w-[201px] h-[44px] font-medium rounded-lg hover:bg-[#b9c0c3] ml-[11px]"
            onClick={addPosition}
          />
        </div>
      </div>

      {/* horizontal line */}
      <div className="w-full border-t border-[#D7D7D7]" />

      {/* bottom buttons */}
      <div className="mt-[56px] mb-[71px] flex flex-col items-center">
        <div className="flex flex-row items-center">
          <Button
            label="Save as draft"
            altStyle="bg-[#FFFFFF] text-[#000000] text-[16px] w-[125px] h-[44px] font-medium rounded-lg border border-[#000000] hover:bg-[#f2f2f2] mr-[15px]"
          />
          <Button
            onClick={handleCreateEvent}
            label="Create event"
            altStyle="bg-[#234254] text-[#FFFFFF] text-[16px] w-[125px] h-[44px] font-medium rounded-lg hover:bg-[#386a80] ml-[15px]"
          />
        </div>
      </div>
    </div>
  );
};

export default EventForm;
