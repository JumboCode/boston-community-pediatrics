"use client";
import {
  eventSchema,
  EVENT_FIELD_LIMITS,
} from "@/lib/schemas/eventSchema";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, type ChangeEvent } from "react";
import BackArrow from "@/assets/icons/arrow-left.svg";
import Button from "@/components/common/buttons/Button";
import Carousel from "../Carousel";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { getPublicURL } from "@/lib/r2";
import BasicSkeleton from "@/components/ui/skeleton/BasicSkeleton";
import DateRangePicker from "@/components/RangeCalendar";

function sanitizeZipInput(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, EVENT_FIELD_LIMITS.zipMaxDigits);
}

// API shapes used by this component
type APIPosition = Partial<{
  id: string;
  position: string;  
  date: string | Date;
  startTime: string | Date;
  endTime: string | Date;
  description: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  totalSlots: number | null;
}>;

type ApiEvent = Partial<{
  id: string;
  name: string;
  date: string[] | Date[];
  startTime: string | Date;
  endTime: string | Date;
  description: string;
  resourcesLink: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  positions: APIPosition[];
  images: string[];
}>;

type PositionState = {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  address: string;
  apt?: string | null;
  city: string;
  state: string;
  zip: string;
  participants: string;
  sameAsDate: boolean;
  sameAsTime: boolean;
  sameAsAddress: boolean;
};

export async function fetchEventById(id: string): Promise<ApiEvent | null> {
  try {
    const response = await fetch(`/api/events?id=${id}`);
    if (!response.ok) {
      console.error("Failed to fetch event", response.statusText);
      return null;
    }
    const data = (await response.json()) as ApiEvent;
    return data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

const createStaticImageData = (url: string): StaticImageData =>
  ({
    src: url,
    height: 0,
    width: 0,
    blurDataURL: "",
    blurWidth: 0,
    blurHeight: 0,
  }) as StaticImageData;

const todayYmd = () => new Date().toISOString().slice(0, 10);

const parseInputDate = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateForDisplay = (value: string) => {
  if (!value) return "Select date";
  const date = parseInputDate(value);
  if (!date) return "Select date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const EventForm = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(!!eventIdParam);
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [openPositionDatePicker, setOpenPositionDatePicker] = useState<
    number | null
  >(null);



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
    startDate: "",
    endDate: "",
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
  const [positions, setPositions] = useState<PositionState[]>([
    {
      id: undefined,
      name: "",
      startDate: "",
      endDate: "",
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
  const [originalPositionIds, setOriginalPositionIds] = useState<string[]>([]);

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const [carouselImages, setCarouselImages] = useState<
    (StaticImageData | string)[]
  >([]);
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
        startDate: "",
        endDate: "",
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
    if (next) {
      clearError(`positions.${index}.startDate`);
      clearError(`positions.${index}.endDate`);
    }
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
        startDate: p.sameAsDate ? event.startDate : p.startDate,
        endDate: p.sameAsDate ? event.endDate : p.endDate,
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

            if (
              (field === "startDate" || field === "endDate") &&
              pos?.sameAsDate
            )
              return [field];
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
          const path = issue.path.filter(
            (p) => typeof p === "string" || typeof p === "number"
          ) as (string | number)[];
          const finalPath = redirectPath(path).join(".");
          if (!(finalPath in fieldErrors))
            fieldErrors[finalPath] = issue.message;
        }

        setErrors(fieldErrors);
        return;
      }

      setErrors({});

      const isEdit = !!eventIdParam;
      const url = isEdit ? `/api/events?id=${eventIdParam}` : "/api/events";
      const method = isEdit ? "PUT" : "POST";

      // When editing, send only the top-level event fields in the shape
      // the server's PUT handler expects (Prisma EventUpdateInput-compatible).
      let payload: Record<string, unknown>;
      if (isEdit) {
        const combineDateTime = (date: string, time: string) =>
          new Date(`${date}T${time}:00`);
        const toMidnight = (date: string) => new Date(`${date}T00:00:00`);
        const generateDateRange = (start: string, end: string) => {
          const dates: Date[] = [];
          const cur = new Date(`${start}T00:00:00`);
          const last = new Date(`${end}T00:00:00`);
          while (cur <= last) {
            dates.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
          }
          return dates;
        };

        payload = {
          name: parseResult.data.title,
          description: parseResult.data.description || "",
          resourcesLink: parseResult.data.resourcesLink || null,
          startTime: combineDateTime(
            parseResult.data.startDate,
            parseResult.data.startTime
          ),
          endTime: combineDateTime(
            parseResult.data.endDate,
            parseResult.data.endTime
          ),
          addressLine1: parseResult.data.address,
          addressLine2: parseResult.data.apt || null,
          city: parseResult.data.city,
          state: parseResult.data.state,
          country: "USA",
          zipCode: parseResult.data.zip,
          date: generateDateRange(
            parseResult.data.startDate,
            parseResult.data.endDate
          ),
        };
      } else {
        payload = parseResult.data;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to ${isEdit ? "update" : "create"} event: ${text}`);
        return;
      }

      const createdEvent = await res.json();

      const eventId: string = isEdit
        ? (eventIdParam as string)
        : (createdEvent.id ?? createdEvent.event?.id);

      if (!eventId) {
        console.error("Event response:", createdEvent);
        alert(
          isEdit
            ? "Event updated but no id available"
            : "Event created but no eventId returned from /api/events"
        );
        return;
      }

      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map((f) => uploadEventImage(eventId, f))
        );
      }

      // Sync positions: create/update/delete via eventPosition API
      if (isEdit) {
        const combineDateTime = (date: string, time: string) =>
          new Date(`${date}T${time}:00`);
        const toMidnight = (date: string) => new Date(`${date}T00:00:00`);

        const currentIds = normalizedPositions
          .map((p) => p.id)
          .filter(Boolean) as string[];
        const toDelete = originalPositionIds.filter(
          (id) => !currentIds.includes(id)
        );

        // delete removed positions
        await Promise.all(
          toDelete.map((id) =>
            fetch(`/api/eventPosition?id=${id}`, { method: "DELETE" }).catch(
              (e) => {
                console.error("Failed to delete position", id, e);
              }
            )
          )
        );

        // upsert remaining positions (PUT if id, POST if new)
        await Promise.all(
          normalizedPositions.map(async (p: PositionState) => {
            const posPayload = {
              position: p.name,
              description: p.description || "",
              date: toMidnight(p.startDate),
              startTime: combineDateTime(p.startDate, p.startTime),
              endTime: combineDateTime(p.endDate, p.endTime),
              totalSlots: Number(p.participants || 0),
              addressLine1: p.address || "",
              addressLine2: p.apt || null,
              city: p.city || "",
              state: p.state || "",
              country: "USA",
              zipCode: p.zip || "",
            };

            if (p.id) {
              await fetch(`/api/eventPosition?id=${p.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(posPayload),
              }).catch((e) =>
                console.error("Failed to update position", p.id, e)
              );
            } else {
              await fetch(`/api/eventPosition`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...posPayload, eventId }),
              }).catch((e) => console.error("Failed to create position", e));
            }
          })
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
    maxLength,
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
    maxLength?: number;
  }) => (
    <div className="flex flex-col w-full">
      <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
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
        min={type === "date" ? todayYmd() : undefined}
        maxLength={maxLength}
        onChange={(e) => {
          onChange(e.target.value);
          onClearError?.();
        }}
        className={
          className ||
          `block w-full min-w-0 md:w-[588px] h-[43px] appearance-none rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:border-bcp-blue
          ${
            error
              ? "border-red-500 focus:ring-red-500/30"
              : "border-medium-gray focus:ring-bcp-blue/30"
          }
          disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed`
        }
        style={
          type === "date"
            ? { WebkitAppearance: "none", appearance: "none" }
            : undefined
        }
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );

  useEffect(() => {
    const mapPositionsArray = (arr: APIPosition[]): PositionState[] =>
      arr.map((p: APIPosition) => ({
        id: p.id ?? undefined,
        name: p.position ?? "",
        startDate: p.startTime
          ? new Date(p.startTime).toISOString().slice(0, 10)
          : "",
        endDate: p.endTime
          ? new Date(p.endTime).toISOString().slice(0, 10)
          : "",
        startTime: p.startTime
          ? new Date(p.startTime).toISOString().slice(11, 16)
          : "",
        endTime: p.endTime
          ? new Date(p.endTime).toISOString().slice(11, 16)
          : "",
        description: p.description ?? "",
        address: p.addressLine1 ?? "",
        apt: p.addressLine2 ?? undefined,
        city: p.city ?? "",
        state: p.state ?? "",
        zip: sanitizeZipInput(String(p.zipCode ?? "")),
        participants: p.totalSlots != null ? String(p.totalSlots) : "",
        sameAsDate: false,
        sameAsTime: false,
        sameAsAddress: false,
      }));

    const load = async () => {
      const id = eventIdParam;
      if (!id) return;
      const result = await fetchEventById(id);
      if (!result) return;

      setEvent({
        title: result.name ?? "",
        startDate: result.startTime
          ? new Date(result.startTime).toISOString().slice(0, 10)
          : "",
        endDate: result.endTime
          ? new Date(result.endTime).toISOString().slice(0, 10)
          : "",
        startTime: result.startTime
          ? new Date(result.startTime).toISOString().slice(11, 16)
          : "",
        endTime: result.endTime
          ? new Date(result.endTime).toISOString().slice(11, 16)
          : "",
        description: result.description ?? "",
        resourcesLink: result.resourcesLink ?? undefined,
        address: result.addressLine1 ?? "",
        apt: result.addressLine2 ?? undefined,
        city: result.city ?? "",
        state: result.state ?? "",
        zip: sanitizeZipInput(String(result.zipCode ?? "")),
      });
      setIsLoading(false);

      // Try to fetch positions from the eventPosition API; fall back to embedded positions
      try {
        const posRes = await fetch(`/api/eventPosition?eventId=${id}`);
        if (posRes.ok) {
          const posData = await posRes.json();
          if (Array.isArray(posData) && posData.length) {
            const mapped = mapPositionsArray(posData as APIPosition[]);
            setPositions(mapped);
            setOriginalPositionIds(
              mapped.map((p: PositionState) => p.id).filter(Boolean) as string[]
            );
          }
        } else if (Array.isArray(result.positions) && result.positions.length) {
          const mapped = mapPositionsArray(result.positions as APIPosition[]);
          setPositions(mapped);
          setOriginalPositionIds(
            mapped.map((p: PositionState) => p.id).filter(Boolean) as string[]
          );
        }
      } catch (err) {
        console.error("Failed to fetch positions:", err);
        if (Array.isArray(result.positions) && result.positions.length) {
          const mapped = mapPositionsArray(result.positions as APIPosition[]);
          setPositions(mapped);
        }
      }

      // Map images (best-effort)
      if (Array.isArray(result.images) && result.images.length) {
        const parsedImages = result.images
          .map((filename) => getPublicURL(filename))
          .filter((url) => url.trim() !== "") as string[];
        setCarouselImages(parsedImages);
      }
    };

    load();
  }, [eventIdParam]);

  if(isLoading) return <BasicSkeleton />;

  return (
    <div className="relative mt-[120px] mb-[138px] flex w-full max-w-[792px] flex-col items-center rounded-lg border border-medium-gray bg-white overflow-hidden">
      {/* back arrow */}
      <div className="mt-[28px] flex w-full justify-start pl-[30px]">
        <Link href="/event" className="cursor-pointer">
          <Image
            src={BackArrow}
            alt="Back arrow"
            className="h-[24px] w-[30.86px]"
          />
        </Link>
      </div>
      {/* title */}
      <h1 className="mt-[22px] text-center text-[36px] font-medium leading-tight text-bcp-blue">
        {eventIdParam ? "Edit event" : "Create a new event"}
      </h1>
      {/* carousel and add photos */}
      <div className="flex w-full flex-col items-center">
        <div className="mt-[26px] w-full px-[30px]">
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
      <div className="px-4 md:px-0 md:mx-[102px] flex flex-col w-full md:w-[588px] min-w-0">
        {/* event title */}
        <div className="flex flex-col items-start w-full">
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
            maxLength={EVENT_FIELD_LIMITS.title}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, title: e.target.value }));
              clearError("title");
            }}
            className={`w-full md:w-[588px] h-[43px] ${inputClass("title")}`}
          />
          <ErrorText k="title" />
        </div>
        {/* event date & time */}
        <div className="flex flex-col items-start">
          <label className="mb-1 mt-[40px] text-base font-normal text-medium-gray">
            Event date &amp; time
          </label>
          <div className="relative">
            <button
              id="event-date"
              type="button"
              onClick={() => setShowEventDatePicker((prev) => !prev)}
              className={`w-[588px] h-[43px] rounded-lg border px-3 flex items-center justify-start text-left text-base
              ${
                errors["startDate"] || errors["endDate"] || errors["startTime"] || errors["endTime"]
                  ? "border-red-500 focus:ring-red-500"
                  : "border-medium-gray focus:ring-bcp-blue/30 focus:border-bcp-blue"
              }`}
            >
              {event.startDate && event.endDate
                ? `${formatDateForDisplay(event.startDate)} – ${formatDateForDisplay(event.endDate)}`
                : event.startDate
                  ? formatDateForDisplay(event.startDate)
                  : "Select dates & times"}
            </button>
            {showEventDatePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEventDatePicker(false)}
                />
                <div className="absolute top-full left-0 mt-2 z-50">
                  <DateRangePicker
                    startDate={event.startDate}
                    endDate={event.endDate}
                    startTime={event.startTime}
                    endTime={event.endTime}
                    onStartDateChange={(ymd) => {
                      setEvent((prev) => ({ ...prev, startDate: ymd }));
                      clearError("startDate");
                    }}
                    onEndDateChange={(ymd) => {
                      setEvent((prev) => ({ ...prev, endDate: ymd }));
                      clearError("endDate");
                    }}
                    onStartTimeChange={(hhmm) => {
                      setEvent((prev) => ({ ...prev, startTime: hhmm }));
                      clearError("startTime");
                    }}
                    onEndTimeChange={(hhmm) => {
                      setEvent((prev) => ({ ...prev, endTime: hhmm }));
                      clearError("endTime");
                    }}
                  />
                </div>
              </>
            )}
          </div>
          {(errors["startDate"] || errors["endDate"] || errors["startTime"] || errors["endTime"]) && (
            <p className="mt-1 text-sm text-red-500">
              {errors["startDate"] || errors["endDate"] || errors["endTime"] || errors["startTime"]}
            </p>
          )}
        </div>
        {/* event description */}
        <div className="flex flex-col items-start w-full">
          <label
            htmlFor="event-description"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Event description
          </label>
          <textarea
            id="event-description"
            value={event.description}
            maxLength={EVENT_FIELD_LIMITS.description}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, description: e.target.value }));
              clearError("description");
            }}
            className={`w-full md:w-[588px] h-[175px] ${textareaClass("description")}`}
          />
          <ErrorText k="description" />
        </div>
        {/* link to resources */}
        <div className="flex flex-col items-start w-full">
          <label
            htmlFor="event-resources"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Link to resources (optional)
          </label>
          <input
            id="event-resources"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://…"
            value={event.resourcesLink || ""}
            maxLength={EVENT_FIELD_LIMITS.resourcesLink}
            onChange={(e) => {
              setEvent((prev) => ({
                ...prev,
                resourcesLink: e.target.value,
              }));
              clearError("resourcesLink");
            }}
            className={`w-[588px] h-[43px] ${inputClass("resourcesLink")}`}
          />
          <ErrorText k="resourcesLink" />
        </div>
        {/* event street */}
        <div className="flex flex-col items-start w-full">
          <label
            htmlFor="event-street"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Street address
          </label>
          <input
            id="event-street"
            value={event.address}
            maxLength={EVENT_FIELD_LIMITS.address}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, address: e.target.value }));
              clearError("address");
            }}
            className={`w-full md:w-[588px] h-[43px] ${inputClass("address")}`}
          />
          <ErrorText k="address" />
        </div>
        {/* event apt */}
        <div className="flex flex-col items-start w-full">
          <label
            htmlFor="event-apt"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            Apt, suite, etc (optional)
          </label>
          <input
            id="event-apt"
            value={event.apt}
            maxLength={EVENT_FIELD_LIMITS.apt}
            onChange={(e) =>
              setEvent((prev) => ({ ...prev, apt: e.target.value }))
            }
            className="w-full md:w-[588px] h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
          />
        </div>
        {/* event city */}
        <div className="flex flex-col items-start w-full">
          <label
            htmlFor="event-city"
            className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
          >
            City
          </label>
          <input
            id="event-city"
            value={event.city}
            maxLength={EVENT_FIELD_LIMITS.city}
            onChange={(e) => {
              setEvent((prev) => ({ ...prev, city: e.target.value }));
              clearError("city");
            }}
            className={`w-full md:w-[588px] h-[43px] ${inputClass("city")}`}
          />
          <ErrorText k="city" />
        </div>
        {/* event state / zip */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-[60px]">
          <div className="flex flex-col items-start w-full">
            <label
              htmlFor="event-state"
              className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
            >
              State
            </label>
            <input
              id="event-state"
              value={event.state}
              maxLength={EVENT_FIELD_LIMITS.state}
              onChange={(e) => {
                setEvent((prev) => ({ ...prev, state: e.target.value }));
                clearError("state");
              }}
              className={`w-full md:w-[264px] h-[43px] ${inputClass("state")}`}
            />
            <ErrorText k="state" />
          </div>
          <div className="flex flex-col items-start w-full">
            <label
              htmlFor="event-zip"
              className="mb-1 mt-[40px] text-base font-normal text-medium-gray"
            >
              Zip code
            </label>
            <input
              id="event-zip"
              inputMode="numeric"
              autoComplete="postal-code"
              value={event.zip}
              maxLength={EVENT_FIELD_LIMITS.zipMaxDigits}
              onChange={(e) => {
                setEvent((prev) => ({
                  ...prev,
                  zip: sanitizeZipInput(e.target.value),
                }));
                clearError("zip");
              }}
              className={`w-full md:w-[264px] h-[43px] ${inputClass("zip")}`}
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
            <div className="flex flex-col items-start w-full">
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
                maxLength={EVENT_FIELD_LIMITS.positionName}
                onChange={(e) => {
                  handlePositionChange(index, "name", e.target.value);
                  clearError(`positions.${index}.name`);
                }}
                className={`w-full md:w-[588px] h-[43px] ${inputClass(`positions.${index}.name`, "disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed")}`}
              />
              <ErrorText k={`positions.${index}.name`} />
            </div>
            {/* position date & time */}
            <div className="flex flex-col">
              <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
                <label className="mb-1 text-base font-normal text-medium-gray">
                  Position date &amp; time
                </label>
                <div className="mb-1 flex items-center gap-[11px]">
                  <Button
                    label="Same as event"
                    altStyle="bg-transparent text-medium-gray font-medium px-0 hover:bg-transparent focus:outline-none"
                    onClick={() => {
                      toggleSameAsDate(index);
                      toggleSameAsTime(index);
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={position.sameAsDate && position.sameAsTime}
                    onChange={() => {
                      const next = !(position.sameAsDate && position.sameAsTime);
                      handlePositionChange(index, "sameAsDate", next);
                      handlePositionChange(index, "sameAsTime", next);
                      if (next) {
                        clearError(`positions.${index}.startDate`);
                        clearError(`positions.${index}.endDate`);
                        clearError(`positions.${index}.startTime`);
                        clearError(`positions.${index}.endTime`);
                      }
                    }}
                    className="h-[16px] w-[16px] cursor-pointer accent-bcp-blue"
                  />
                </div>
              </div>

              {position.sameAsDate && position.sameAsTime ? (
                <div className="w-[588px] h-[43px] rounded-lg border border-medium-gray px-3 flex items-center text-base text-medium-gray bg-light-gray cursor-not-allowed">
                  {event.startDate && event.endDate
                    ? `${formatDateForDisplay(event.startDate)} – ${formatDateForDisplay(event.endDate)}`
                    : "Same as event"}
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenPositionDatePicker((current) =>
                        current === index ? null : index
                      )
                    }
                    className={`w-[588px] h-[43px] rounded-lg border px-3 flex items-center justify-start text-left text-base text-medium-gray
                    ${
                      errors[`positions.${index}.startDate`] ||
                      errors[`positions.${index}.endDate`] ||
                      errors[`positions.${index}.startTime`] ||
                      errors[`positions.${index}.endTime`]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-medium-gray focus:ring-bcp-blue/30 focus:border-bcp-blue"
                    }`}
                  >
                    {position.startDate && position.endDate
                      ? `${formatDateForDisplay(position.startDate)} – ${formatDateForDisplay(position.endDate)}`
                      : position.startDate
                        ? formatDateForDisplay(position.startDate)
                        : "Select dates & times"}
                  </button>
                  {openPositionDatePicker === index && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenPositionDatePicker(null)}
                      />
                      <div className="absolute top-full left-0 mt-2 z-50">
                        <DateRangePicker
                          startDate={position.startDate}
                          endDate={position.endDate}
                          startTime={position.startTime}
                          endTime={position.endTime}
                          onStartDateChange={(ymd) => {
                            handlePositionChange(index, "startDate", ymd);
                            clearError(`positions.${index}.startDate`);
                          }}
                          onEndDateChange={(ymd) => {
                            handlePositionChange(index, "endDate", ymd);
                            clearError(`positions.${index}.endDate`);
                          }}
                          onStartTimeChange={(hhmm) => {
                            handlePositionChange(index, "startTime", hhmm);
                            clearError(`positions.${index}.startTime`);
                          }}
                          onEndTimeChange={(hhmm) => {
                            handlePositionChange(index, "endTime", hhmm);
                            clearError(`positions.${index}.endTime`);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {(errors[`positions.${index}.startDate`] ||
                errors[`positions.${index}.endDate`] ||
                errors[`positions.${index}.startTime`] ||
                errors[`positions.${index}.endTime`]) && (
                <p className="mt-1 text-sm text-red-500">
                  {errors[`positions.${index}.startDate`] ||
                    errors[`positions.${index}.endDate`] ||
                    errors[`positions.${index}.endTime`] ||
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
                maxLength={EVENT_FIELD_LIMITS.description}
                onChange={(e) => {
                  handlePositionChange(index, "description", e.target.value);
                  clearError(`positions.${index}.description`);
                }}
                className={`w-full md:w-[588px] h-[175px] ${textareaClass(`positions.${index}.description`)}`}
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
              maxLength={EVENT_FIELD_LIMITS.address}
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
                value={
                  position.sameAsAddress ? event.apt || "" : position.apt || ""
                }
                disabled={position.sameAsAddress}
                maxLength={EVENT_FIELD_LIMITS.apt}
                onChange={(e) =>
                  handlePositionChange(index, "apt", e.target.value)
                }
                className="w-full md:w-[588px] h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed"
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
                maxLength={EVENT_FIELD_LIMITS.city}
                onChange={(e) => {
                  handlePositionChange(index, "city", e.target.value);
                  clearError(`positions.${index}.city`);
                }}
                className={`w-full md:w-[588px] h-[43px] ${inputClass(`positions.${index}.city`,
                  "disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed"
                )}`}
              />
              <ErrorText k={`positions.${index}.city`} />
            </div>
            {/* position state / zip */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-[60px]">
              <div className="flex flex-col items-start w-full">
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
                  maxLength={EVENT_FIELD_LIMITS.state}
                  onChange={(e) => {
                    handlePositionChange(index, "state", e.target.value);
                    clearError(`positions.${index}.state`);
                  }}
                  className={`w-full md:w-[264px] h-[43px] ${inputClass(`positions.${index}.state`,
                    "disabled:bg-light-gray disabled:text-medium-gray disabled:placeholder:text-medium-gray disabled:cursor-not-allowed"
                  )}`}
                />
                <ErrorText k={`positions.${index}.state`} />
              </div>
              <div className="flex flex-col items-start w-full">
                <label
                  htmlFor={`position-zip-${index}`}
                  className="mb-1 mt-10 text-base font-normal text-medium-gray"
                >
                  Zip code
                </label>
                <input
                  id={`position-zip-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={position.sameAsAddress ? event.zip : position.zip}
                  disabled={position.sameAsAddress}
                  maxLength={EVENT_FIELD_LIMITS.zipMaxDigits}
                  onChange={(e) => {
                    handlePositionChange(
                      index,
                      "zip",
                      sanitizeZipInput(e.target.value),
                    );
                    clearError(`positions.${index}.zip`);
                  }}
                  className={`w-full md:w-[264px] h-[43px] ${inputClass(`positions.${index}.zip`,
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
                min={1}
                max={
                  10 ** EVENT_FIELD_LIMITS.participantsMaxDigits - 1
                }
                value={position.participants}
                onChange={(e) => {
                  handlePositionChange(index, "participants", e.target.value);
                  clearError(`positions.${index}.participants`);
                }}
                className={`w-full md:w-[588px] h-[43px] ${inputClass(`positions.${index}.participants`)}`}
              />
              <ErrorText k={`positions.${index}.participants`} />
            </div>
          </div>
        ))}
      </div>

      {/* position buttons */}
      <div className="mt-[56px] mb-[71px] flex flex-col items-center w-full px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <Button
            label="Remove position"
            altStyle="bg-white text-bcp-blue text-[16px] w-[153px] h-[44px] font-medium rounded-lg hover:bg-[#f2f2f2]"
            onClick={removePosition}
          />
          <Button
            label="+ Add another position"
            altStyle="bg-[#CAD1D4] text-black text-[16px] w-[201px] h-[44px] font-medium rounded-lg hover:bg-[#b9c0c3]"
            onClick={addPosition}
          />
        </div>
      </div>

      {/* horizontal line */}
      <div className="w-full border-t border-[#D7D7D7]" />

      {/* bottom buttons */}
      <div className="mt-[56px] mb-[71px] flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <Button
            label="Save as draft"
            altStyle="bg-white text-black text-[16px] w-[125px] h-[44px] font-medium rounded-lg border border-black hover:bg-[#f2f2f2]"
          />
          <Button
            onClick={handleCreateEvent}
            label="Submit"
            altStyle="bg-bcp-blue text-white text-[16px] w-[125px] h-[44px] font-medium rounded-lg hover:bg-[#386a80]"
          />
        </div>
      </div>
    </div>
  );
};

export default EventForm;
