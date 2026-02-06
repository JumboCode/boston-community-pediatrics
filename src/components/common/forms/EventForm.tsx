"use client";
import { eventSchema } from "@/lib/schemas/eventSchema";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState, useRef, type ChangeEvent } from "react";
import BackArrow from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/buttons/Button";
import Carousel from "../Carousel";
import { mutate } from "swr";
import { useRouter } from "next/navigation";


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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();


  const inputBase =
    "rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2";

  const inputClass = (key: string, extra = "") =>
    `${inputBase} ${
      errors[key]
        ? "border-red-500 focus:ring-red-500/30"
        : "border-medium-gray focus:ring-bcp-blue/30 focus:border-bcp-blue"
    } ${extra}`;

  const textareaBase =
    "resize-none rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2";

  const textareaClass = (key: string, extra = "") =>
    `${textareaBase} ${
      errors[key]
        ? "border-red-500 focus:ring-red-500/30"
        : "border-medium-gray focus:ring-bcp-blue/30 focus:border-bcp-blue"
    } ${extra}`;

  const ErrorText = ({ k }: { k: string }) =>
    errors[k] ? <p className="mt-1 text-sm text-red-500">{errors[k]}</p> : null;

  const [event, setEvent] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
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

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const [carouselImages, setCarouselImages] = useState<StaticImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleAddPhotosClick = () => fileInputRef.current?.click();
  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: StaticImageData[] = [];
    const newFiles: File[] = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const ALLOWED_TYPES = ["image/jpeg", "image/png"];
    const oversizedFiles: string[] = [];
    const invalidFiles: string[] = [];

    const TARGET_WIDTH = 1000;
    const TARGET_HEIGHT = 360;

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

      try {
        const img = new window.Image();
        const objectUrl = URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = objectUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          continue;
        }

        // truncate image to fit
        const imgRatio = img.width / img.height;
        const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;

        let sX, sY, sW, sH;

        if (imgRatio > targetRatio) {
          // if image wider, then truncate sides
          sH = img.height;
          sW = img.height * targetRatio;
          sX = (img.width - sW) / 2;
          sY = 0;
        } else {
          // if image taller, then truncate top and bottom
          sW = img.width;
          sH = img.width / targetRatio;
          sX = 0;
          sY = (img.height - sH) / 2;
        }

        ctx.drawImage(img, sX, sY, sW, sH, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, file.type, 0.92);
        });

        URL.revokeObjectURL(objectUrl);

        if (!blob) continue;

        const resizedFile = new File([blob], file.name, {
          type: file.type,
        });

        newFiles.push(resizedFile);
        const url = URL.createObjectURL(resizedFile);
        newImages.push(createStaticImageData(url));
      } catch (error) {
        console.error(`Failed to process image ${file.name}:`, error);
        continue;
      }
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
  const toggleSameAsDate = (index: number) => {
    const next = !positions[index].sameAsDate;
    handlePositionChange(index, "sameAsDate", next);
    if (next) clearError(`positions.${index}.date`);
  };
  const toggleSameAsTime = (index: number) => {
    const next = !positions[index].sameAsTime;
    handlePositionChange(index, "sameAsTime", next);
    if (next) {
      clearError(`positions.${index}.startTime`);
      clearError(`positions.${index}.endTime`);
    }
  };
  const toggleSameAsAddress = (index: number) => {
    const next = !positions[index].sameAsAddress;
    handlePositionChange(index, "sameAsAddress", next);
    if (next) {
      clearError(`positions.${index}.address`);
      clearError(`positions.${index}.city`);
      clearError(`positions.${index}.state`);
      clearError(`positions.${index}.zip`);
      clearError(`positions.${index}.apt`);
    }
  };
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
        const fieldErrors: Record<string, string> = {};

        const redirectPath = (path: (string | number)[]) => {
          if (path[0] === "positions" && typeof path[1] === "number") {
            const idx = path[1];
            const field = String(path[2] ?? "");
            const pos = positions[idx];

            if (field === "date" && pos?.sameAsDate) return ["date"];
            if (
              (field === "startTime" || field === "endTime") &&
              pos?.sameAsTime
            )
              return [field];
            if (
              ["address", "apt", "city", "state", "zip"].includes(field) &&
              pos?.sameAsAddress
            )
              return [field];
          }
          return path;
        };

        for (const issue of parseResult.error.issues) {
          const finalPath = redirectPath(issue.path).join(".");
          if (!(finalPath in fieldErrors))
            fieldErrors[finalPath] = issue.message;
        }

        setErrors(fieldErrors);
        return;
      }

      setErrors({});

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
      router.push(`/event/${eventId}`); // Redirects to the newly created page

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
    error,
    onClearError,
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
    error?: string;
    onClearError?: () => void;
  }) => (
    <div className="flex flex-col">
      <div className="mt-10 flex items-center justify-between">
        <label
          htmlFor={id}
          className="mb-1 text-base font-normal text-medium-gray"
        >
          {label}
        </label>
        <div className="mb-1 flex items-center gap-[11px]">
          <Button
            label="Same as event"
            altStyle="bg-transparent text-medium-gray font-medium px-0 hover:bg-transparent focus:outline-none"
            onClick={onToggle}
          />
          <input
            type="checkbox"
            checked={disabled}
            onChange={onToggle}
            className="h-[16px] w-[16px] cursor-pointer accent-bcp-blue"
          />
        </div>
      </div>
      <input
        id={id}
        type={type}
        value={disabled ? fallbackValue : value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          onClearError?.();
        }}
        className={
          className ||
          `w-[588px] h-[43px] rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:border-bcp-blue
           ${
             error
               ? "border-red-500 focus:ring-red-500/30"
               : "border-medium-gray focus:ring-bcp-blue/30"
           }
           disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed`
        }
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="relative mt-[120px] mb-[138px] flex w-[792px] flex-col items-center rounded-lg border border-medium-gray bg-white">
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
      <h1 className="mt-[22px] text-center text-[36px] font-medium leading-tight text-bcp-blue">
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
            altStyle="bg-bcp-blue text-white text-[16px] w-[118px] h-[44px] rounded-lg hover:bg-[#386a80]"
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
            className="mt-[24px] mb-1 text-base font-normal text-medium-gray"
          >
            Event title
          </label>
          <input
            id="event-title"
            type="text"
            value={event.title}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, title: e.target.value }));
              clearError("title");
            }}
            className={`w-[588px] h-[43px] ${inputClass("title")}`}
          />
          <ErrorText k="title" />
        </div>
        {/* event date */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-date"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Event date
          </label>
          <input
            id="event-date"
            type="date"
            value={event.date}
            onChange={(e) => {
              const v = e.target.value;
              setEvent((prev) => ({ ...prev, date: v }));
              clearError("date");
            }}
            className={`w-[588px] h-[43px] rounded-lg border p-3 text-base
            ${
              errors["date"]
                ? "border-red-500 focus:ring-red-500"
                : "border-medium-gray focus:ring-bcp-blue/30 focus:border-bcp-blue"
            }`}
          />
          {errors["date"] && (
            <p className="mt-1 text-sm text-red-500">{errors["date"]}</p>
          )}
        </div>
        {/* event time */}
        <div className="flex flex-col items-start">
          <label className="mb-1 mt-[40px] text-base font-normal text-medium-gray">
            Event time
          </label>

          <div className="flex w-[588px] gap-[60px]">
            <input
              id="event-start-time"
              type="time"
              value={event.startTime}
              onChange={(e) => {
                const v = e.target.value;
                setEvent((prev) => ({ ...prev, startTime: v }));
                clearError("startTime");
              }}
              className={`w-[282px] h-[43px] rounded-lg border p-3 text-base text-medium-gray focus:outline-none
              ${
                errors["startTime"]
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                  : "border-medium-gray focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              }`}
            />

            <input
              id="event-end-time"
              type="time"
              value={event.endTime}
              onChange={(e) => {
                const v = e.target.value;
                setEvent((prev) => ({ ...prev, endTime: v }));
                clearError("endTime");
              }}
              className={`w-[282px] h-[43px] rounded-lg border p-3 text-base text-medium-gray focus:outline-none
              ${
                errors["endTime"]
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
                  : "border-medium-gray focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              }`}
            />
          </div>

          {(errors["startTime"] || errors["endTime"]) && (
            <p className="mt-1 text-sm text-red-500">
              {errors["endTime"] ?? errors["startTime"]}
            </p>
          )}
        </div>
        {/* event description */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-description"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Event description
          </label>
          <textarea
            id="event-description"
            value={event.description}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, description: e.target.value }));
              clearError("description");
            }}
            className={`w-[588px] h-[175px] ${textareaClass("description")}`}
          />
          <ErrorText k="description" />
        </div>
        {/* link to resources */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-resources"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
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
            className="w-[588px] h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
          />
        </div>
        {/* event street */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-street"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Street address
          </label>
          <input
            id="event-street"
            value={event.address}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, address: e.target.value }));
              clearError("address");
            }}
            className={`w-[588px] h-[43px] ${inputClass("address")}`}
          />
          <ErrorText k="address" />
        </div>
        {/* event apt */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-apt"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Apt, suite, etc (optional)
          </label>
          <input
            id="event-apt"
            value={event.apt}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, apt: e.target.value }))
            }
            className="w-[588px] h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
          />
        </div>
        {/* event city */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event-city"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            City
          </label>
          <input
            id="event-city"
            value={event.city}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, city: e.target.value }));
              clearError("city");
            }}
            className={`w-[588px] h-[43px] ${inputClass("city")}`}
          />
          <ErrorText k="city" />
        </div>
        {/* event state / zip */}
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="event-state"
              className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
            >
              State
            </label>
            <input
              id="event-state"
              value={event.state}
              onChange={(e) => {
                setEvent((prev) => ({ ...prev, state: e.target.value }));
                clearError("state");
              }}
              className={`w-[264px] h-[43px] ${inputClass("state")}`}
            />
            <ErrorText k="state" />
          </div>
          <div className="flex flex-col items-start">
            <label
              htmlFor="event-zip"
              className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
            >
              Zip code
            </label>
            <input
              id="event-zip"
              inputMode="numeric"
              value={event.zip}
              onChange={(e) => {
                setEvent((prev) => ({ ...prev, zip: e.target.value }));
                clearError("zip");
              }}
              className={`w-[264px] h-[43px] ${inputClass("zip")}`}
            />
            <ErrorText k="zip" />
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
                className="mb-1 text-[16px] text-base font-normal text-medium-gray"
              >
                Position name
              </label>
              <input
                id={`position-name-${index}`}
                type="text"
                value={position.name}
                onChange={(e) => {
                  handlePositionChange(index, "name", e.target.value);
                  clearError(`positions.${index}.name`);
                }}
                className={`w-[588px] h-[43px] ${inputClass(`positions.${index}.name`, "disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed")}`}
              />
              <ErrorText k={`positions.${index}.name`} />
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
              error={errors[`positions.${index}.date`]}
              onClearError={() => clearError(`positions.${index}.date`)}
            />
            {/* position time */}
            <div className="flex flex-col">
              <div className="mt-10 flex items-center justify-between">
                <label className="mb-1 text-base font-normal text-medium-gray">
                  Position time
                </label>

                <div className="mb-1 flex items-center gap-[11px]">
                  <Button
                    label="Same as event"
                    altStyle="bg-transparent text-medium-gray font-medium px-0 hover:bg-transparent focus:outline-none"
                    onClick={() => toggleSameAsTime(index)}
                  />
                  <input
                    type="checkbox"
                    checked={position.sameAsTime}
                    onChange={() => toggleSameAsTime(index)}
                    className="h-[16px] w-[16px] cursor-pointer accent-bcp-blue"
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
                  onChange={(e) => {
                    handlePositionChange(index, "startTime", e.target.value);
                    clearError(`positions.${index}.startTime`);
                  }}
                  className={`w-[282px] h-[43px] rounded-lg border p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:border-bcp-blue
                  ${
                    errors[`positions.${index}.startTime`]
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-medium-gray focus:ring-bcp-blue/30"
                  }
                  disabled:bg-light-gray disabled:cursor-not-allowed`}
                />

                <input
                  id={`position-end-time-${index}`}
                  type="time"
                  value={position.sameAsTime ? event.endTime : position.endTime}
                  disabled={position.sameAsTime}
                  onChange={(e) => {
                    handlePositionChange(index, "endTime", e.target.value);
                    clearError(`positions.${index}.endTime`);
                  }}
                  className={`w-[282px] h-[43px] rounded-lg border p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:border-bcp-blue
                  ${
                    errors[`positions.${index}.endTime`]
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-medium-gray focus:ring-bcp-blue/30"
                  }
                  disabled:bg-light-gray disabled:cursor-not-allowed`}
                />
              </div>
              {(errors[`positions.${index}.startTime`] ||
                errors[`positions.${index}.endTime`]) && (
                <p className="mt-1 text-sm text-red-500">
                  {errors[`positions.${index}.endTime`] ??
                    errors[`positions.${index}.startTime`]}
                </p>
              )}
            </div>
            {/* position description */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-description-${index}`}
                className="mb-1 mt-10 text-base font-normal text-medium-gray"
              >
                Position description
              </label>
              <textarea
                id={`position-description-${index}`}
                value={position.description}
                onChange={(e) => {
                  handlePositionChange(index, "description", e.target.value);
                  clearError(`positions.${index}.description`);
                }}
                className={`w-[588px] h-[175px] ${textareaClass(`positions.${index}.description`)}`}
              />
              <ErrorText k={`positions.${index}.description`} />
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
              error={errors[`positions.${index}.address`]}
              onClearError={() => clearError(`positions.${index}.address`)}
            />
            {/* position apt */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-apt-${index}`}
                className="mb-1 mt-10 text-base font-normal text-medium-gray"
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
                className="w-[588px] h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed"
              />
            </div>
            {/* position city */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-city-${index}`}
                className="mb-1 mt-10 text-base font-normal text-medium-gray"
              >
                City
              </label>
              <input
                id={`position-city-${index}`}
                type="text"
                value={position.sameAsAddress ? event.city : position.city}
                disabled={position.sameAsAddress}
                onChange={(e) => {
                  handlePositionChange(index, "city", e.target.value);
                  clearError(`positions.${index}.city`);
                }}
                className={`w-[588px] h-[43px] ${inputClass(
                  `positions.${index}.city`,
                  "disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed"
                )}`}
              />
              <ErrorText k={`positions.${index}.city`} />
            </div>
            {/* position state / zip */}
            <div className="flex flex-row gap-[60px]">
              <div className="flex flex-col items-start">
                <label
                  htmlFor={`position-state-${index}`}
                  className="mb-1 mt-10 text-base font-normal text-medium-gray"
                >
                  State
                </label>
                <input
                  id={`position-state-${index}`}
                  type="text"
                  value={position.sameAsAddress ? event.state : position.state}
                  disabled={position.sameAsAddress}
                  onChange={(e) => {
                    handlePositionChange(index, "state", e.target.value);
                    clearError(`positions.${index}.state`);
                  }}
                  className={`w-[264px] h-[43px] ${inputClass(
                    `positions.${index}.state`,
                    "disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed"
                  )}`}
                />
                <ErrorText k={`positions.${index}.state`} />
              </div>
              <div className="flex flex-col items-start">
                <label
                  htmlFor={`position-zip-${index}`}
                  className="mb-1 mt-10 text-base font-normal text-medium-gray"
                >
                  Zip code
                </label>
                <input
                  id={`position-zip-${index}`}
                  type="text"
                  value={position.sameAsAddress ? event.zip : position.zip}
                  disabled={position.sameAsAddress}
                  onChange={(e) => {
                    handlePositionChange(index, "zip", e.target.value);
                    clearError(`positions.${index}.zip`);
                  }}
                  className={`w-[264px] h-[43px] ${inputClass(
                    `positions.${index}.zip`,
                    "disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed"
                  )}`}
                />
                <ErrorText k={`positions.${index}.zip`} />
              </div>
            </div>
            {/* max participants */}
            <div className="flex flex-col">
              <label
                htmlFor={`position-participants-${index}`}
                className="mb-1 mt-10 text-base font-normal text-medium-gray"
              >
                Maximum number of participants
              </label>
              <input
                id={`position-participants-${index}`}
                type="number"
                value={position.participants}
                onChange={(e) => {
                  handlePositionChange(index, "participants", e.target.value);
                  clearError(`positions.${index}.participants`);
                }}
                className={`w-[588px] h-[43px] ${inputClass(`positions.${index}.participants`)}`}
              />
              <ErrorText k={`positions.${index}.participants`} />
            </div>
          </div>
        ))}
      </div>

      {/* position buttons */}
      <div className="mt-[56px] mb-[71px] flex flex-col items-center">
        <div className="flex flex-row items-center">
          <Button
            label="Remove position"
            altStyle="bg-white text-bcp-blue text-[16px] w-[153px] h-[44px] font-medium rounded-lg hover:bg-[#f2f2f2] mr-[11px]"
            onClick={removePosition}
          />
          <Button
            label="+ Add another position"
            altStyle="bg-[#CAD1D4] text-black text-[16px] w-[201px] h-[44px] font-medium rounded-lg hover:bg-[#b9c0c3] ml-[11px]"
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
            altStyle="bg-white text-black text-[16px] w-[125px] h-[44px] font-medium rounded-lg border border-black hover:bg-[#f2f2f2] mr-[15px]"
          />
          <Button
            onClick={handleCreateEvent}
            label="Create event"
            altStyle="bg-bcp-blue text-white text-[16px] w-[125px] h-[44px] font-medium rounded-lg hover:bg-[#386a80] ml-[15px]"
          />
        </div>
      </div>
    </div>
  );
};

export default EventForm;
