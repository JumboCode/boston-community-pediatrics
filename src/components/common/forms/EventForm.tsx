"use client";
import { eventSchema } from "@/lib/schemas/eventSchema";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState, useRef, type ChangeEvent } from "react";
import BackArrow from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/buttons/Button";
import Carousel from "../Carousel";
import { mutate } from "swr";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [event, setEvent] = useState({
    title: "",
    date: "",
    startTime: "12:30", //the time lowk only works (when we do same as event) when we set a default time here
    endTime: "13:30",
    description: "",
    resourcesLink: "" as string | undefined,
    address: "",
    apt: "" as string | undefined,
    city: "",
    state: "",
    zip: "",
  });
  const [positions, setPositions] = useState([
    {
      name: "",
      date: "",
      startTime: "",
      endTime: "",
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

  const toISODateAtMidnight = (dateStr: string) => {
    return new Date(`${dateStr}T00:00:00`).toISOString();
  };

  const toISODateTime = (dateStr: string, timeStr: string) => {
    return new Date(`${dateStr}T${timeStr}:00`).toISOString();
  };

  const [carouselImages, setCarouselImages] = useState<StaticImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleAddPhotosClick = () => fileInputRef.current?.click();
  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: StaticImageData[] = [];
    const newFiles: File[] = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
    const oversizedFiles: string[] = [];
    const invalidFiles: string[] = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (${file.type || "unknown type"})`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(
          `${file.name} (${(file.size / 1024).toFixed(2)}KB)`
        );
        continue;
      }

      newFiles.push(file);

      const url = URL.createObjectURL(file);
      newImages.push(createStaticImageData(url));
    }

    if (invalidFiles.length > 0) {
      alert(
        `The following files are not supported. Only JPG/JPEG/PNG files are allowed:\n\n${invalidFiles.join("\n")}`
      );
    }

    if (oversizedFiles.length > 0) {
      alert(
        `The following files exceed the 10MB limit and were not added:\n\n${oversizedFiles.join("\n")}`
      );
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setCarouselImages((prev) => [...prev, ...newImages]);
    }
    e.target.value = "";
  };
  const addPosition = () =>
    setPositions((prev) => [
      ...prev,
      {
        name: "",
        date: "",
        startTime: "",
        endTime: "",
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
  async function uploadEventImage(eventId: string, file: File) {
    const presignRes = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "event", eventId }),
    });

    if (!presignRes.ok) {
      const text = await presignRes.text();
      throw new Error(`Failed to get upload URL: ${presignRes.status} ${text}`);
    }

    const { key, url } = (await presignRes.json()) as {
      key: string;
      url: string;
    };

    const putRes = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!putRes.ok) {
      const text = await putRes.text();
      throw new Error(`Failed to upload file to R2: ${putRes.status} ${text}`);
    }

    return key;
  }

  const handleCreateEvent = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const normalizedPositions = positions.map((p) => ({
        ...p,
        date: p.sameAsDate ? event.date : p.date,
        startTime: p.sameAsTime ? event.startTime : p.startTime,
        endTime: p.sameAsTime ? event.endTime : p.endTime,
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
        const errorMessages = parseResult.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("\n");

        window.alert(`Please fix these errors:\n\n${errorMessages}`);
        return;
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to create event: ${text}`);
        return;
      }

      const createdEvent = await res.json();

      const eventId: string = createdEvent.id ?? createdEvent.event?.id;
      if (!eventId) {
        console.error("Create event response:", createdEvent);
        alert("Event created but no eventId returned from /api/events");
        return;
      }

      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map((f) => uploadEventImage(eventId, f))
        );
      }

      await mutate("/api/events");

      setSelectedFiles([]);
      setCarouselImages([]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ConditionalInput = ({
    id,
    label,
    type,
    value,
    fallbackValue,
    disabled,
    onToggle,
    onChange,
    className,
  }: {
    id: string;
    label: string;
    type: "text" | "date" | "time" | "number" | "url";
    value: string;
    fallbackValue: string;
    disabled: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
    className?: string;
  }) => (
    <div className="flex flex-col">
      <div className="mt-10 flex items-center justify-between">
        <label
          htmlFor={id}
          className="mb-1 text-base font-normal text-[#6B6B6B]"
        >
          {label}
        </label>
        <div className="mb-1 flex items-center gap-[11px]">
          <Button
            label="Same as event"
            altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
            onClick={onToggle}
          />
          <input
            type="checkbox"
            checked={disabled}
            onChange={onToggle}
            className="h-[16px] w-[16px] cursor-pointer accent-[#234254]"
          />
        </div>
      </div>
      <input
        id={id}
        type={type}
        value={disabled ? fallbackValue : value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={
          className ||
          "w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:text-[#6B6B6B] disabled:placeholder:text-[#6B6B6B] disabled:cursor-not-allowed"
        }
      />
    </div>
  );

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
          accept=".jpg, .jpeg, .png"
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
          <label className="mb-1 mt-[40px] text-base font-normal text-[#6B6B6B]">
            Event time
          </label>

          <div className="flex w-[588px] gap-[60px]">
            <input
              id="event-start-time"
              type="time"
              value={event.startTime}
              onChange={(e) =>
                setEvent((prev) => ({ ...prev, startTime: e.target.value }))
              }
              className="w-[282px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />

            <input
              id="event-end-time"
              type="time"
              value={event.endTime}
              onChange={(e) =>
                setEvent((prev) => ({ ...prev, endTime: e.target.value }))
              }
              className="w-[282px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
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
            value={event.resourcesLink || ""}
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
            <ConditionalInput
              id={`position-date-${index}`}
              label="Position date"
              type="date"
              value={position.date}
              fallbackValue={event.date}
              disabled={position.sameAsDate}
              onToggle={() => toggleSameAsDate(index)}
              onChange={(val) => handlePositionChange(index, "date", val)}
            />
            {/* position time */}
            <div className="flex flex-col">
              <div className="mt-10 flex items-center justify-between">
                <label className="mb-1 text-base font-normal text-[#6B6B6B]">
                  Position time
                </label>

                <div className="mb-1 flex items-center gap-[11px]">
                  <Button
                    label="Same as event"
                    altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
                    onClick={() => toggleSameAsTime(index)}
                  />
                  <input
                    type="checkbox"
                    checked={position.sameAsTime}
                    onChange={() => toggleSameAsTime(index)}
                    className="h-[16px] w-[16px] cursor-pointer accent-[#234254]"
                  />
                </div>
              </div>

              <div className="flex w-[588px] gap-[60px]">
                <input
                  id={`position-start-time-${index}`}
                  type="time"
                  value={
                    position.sameAsTime ? event.startTime : position.startTime
                  }
                  disabled={position.sameAsTime}
                  onChange={(e) =>
                    handlePositionChange(index, "startTime", e.target.value)
                  }
                  className="w-[282px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:cursor-not-allowed"
                />

                <input
                  id={`position-end-time-${index}`}
                  type="time"
                  value={position.sameAsTime ? event.endTime : position.endTime}
                  disabled={position.sameAsTime}
                  onChange={(e) =>
                    handlePositionChange(index, "endTime", e.target.value)
                  }
                  className="w-[282px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254] disabled:bg-[#E5E5E5] disabled:cursor-not-allowed"
                />
              </div>
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
            <ConditionalInput
              id={`position-address-${index}`}
              label="Street address"
              type="text"
              value={position.address}
              fallbackValue={event.address}
              disabled={position.sameAsAddress}
              onToggle={() => toggleSameAsAddress(index)}
              onChange={(val) => handlePositionChange(index, "address", val)}
            />
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
