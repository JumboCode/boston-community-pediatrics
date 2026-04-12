"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import Link from "next/link";

interface FrontEndEvent {
  id: string;
  name: string;
  startTime: Date;
  capacity: number;
  selected: boolean;
}

interface ApiEvent {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  positions: Array<{
    totalSlots: number;
  }>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
};

const ManageEventsPage = () => {
  const [events, setEvents] = useState<FrontEndEvent[]>([]);

  // search/dropdown helpers
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [filterOption, setFilterOption] = useState<
    "OLDEST" | "MOST_RECENT" | "PAST" | "UPCOMING"
  >("MOST_RECENT");

  const router = useRouter();

  // Fetch events
  const { data: allEvents, isLoading: isLoadingEvents } = useSWR<ApiEvent[]>(
    `/api/events`,
    fetcher
  );

  const frontEndEvents = useMemo(() => {
    if (!allEvents) return [];
    return allEvents.map((event): FrontEndEvent => {
      const capacity = event.positions.reduce(
        (sum, position) => sum + position.totalSlots,
        0
      );
      return {
        id: event.id,
        name: event.name,
        startTime: new Date(event.startTime),
        capacity,
        selected: false,
      };
    });
  }, [allEvents]);

  useEffect(() => {
    setEvents(frontEndEvents);
  }, [frontEndEvents]);

  // Event selection
  const toggleSelect = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, selected: !event.selected } : event
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = events.every((event) => event.selected);
    setEvents((prev) =>
      prev.map((event) => ({ ...event, selected: !allSelected }))
    );
  };

  const selectedCount = events.filter((event) => event.selected).length;

  const seenEvents = events.filter((event) => {
    const eventName = event.name.toLowerCase();
    return eventName.includes(searchQuery.toLowerCase());
  });

  const filteredAndSortedEvents = useMemo(() => {
    let list = [...events];
    const now = new Date();

    // Apply filters
    if (filterOption === "PAST") {
      list = list.filter((event) => event.startTime < now);
    } else if (filterOption === "UPCOMING") {
      list = list.filter((event) => event.startTime >= now);
    }

    // Apply sorting
    if (filterOption === "OLDEST") {
      list.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    } else if (filterOption === "MOST_RECENT") {
      list.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }

    return list;
  }, [events, filterOption]);

  function addEvent(id: string) {
    toggleSelect(id);
    setSearchQuery("");
    setDropdownOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  if (isLoadingEvents) {
    return <div>Loading events...</div>;
  }

  return (
    <>
      <div className="items-center justify-center p-6 ml-60 mr-60">
        <h1 className="text-[16px] font-semibold mb-6 text-bcp-blue">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <Link href="/admin/manage" className="hover:underline">
            Manage
          </Link>
          {" / "}
          <Link href="/admin/manage/event" className="hover:underline">
            Events
          </Link>
        </h1>

        {/* search bar + filter dropdown */}
        <div className="mb-4 flex items-center gap-4 w-full">
          <div ref={containerRef} className="relative flex-1">
            <div
              className={`min-h-[44px] w-full rounded-lg border px-3 py-2
                  flex flex-wrap gap-2 cursor-text focus-within:ring-2`}
              onClick={() => setDropdownOpen(true)}
            >
              {events
                .filter((event) => event.selected)
                .map((event) => (
                  <span
                    key={event.id}
                    className="flex items-center gap-1 border border-gray-400
                    rounded-full px-3 py-0.5 text-sm text-medium-black bg-white
                    whitespace-nowrap"
                  >
                    {event.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(event.id);
                      }}
                      className="ml-1 text-gray-500 hover:text-red-500
                      leading-none"
                      aria-label={`Remove ${event.name}`}
                    >
                      x
                    </button>
                  </span>
                ))}
              <span className="flex-1 min-w-[4px]" />
            </div>

            {dropdownOpen && (
              <div
                className="absolute z-50 left-0 right-0 bg-white border
                    border-medium-gray rounded-lg shadow-lg mt-1"
              >
                <div className="p-2 border-b border-gray-100">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by event name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && seenEvents.length > 0) {
                        addEvent(seenEvents[0].id);
                      }
                    }}
                    className="w-full border-none outline-none focus:ring-0 text-sm"
                  />
                </div>
                {seenEvents.length === 0 && searchQuery ? (
                  <div className="p-2 text-sm text-gray-500">No results</div>
                ) : (
                  <div className="max-h-[320px] overflow-y-auto">
                    {seenEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addEvent(event.id);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left text-sm"
                      >
                        {event.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* filter dropdown */}
          <div className="w-40">
            <label htmlFor="filter" className="sr-only">
              Filter events
            </label>
            <select
              id="filter"
              value={filterOption}
              onChange={(e) =>
                setFilterOption(
                  e.target.value as "OLDEST" | "MOST_RECENT" | "PAST" | "UPCOMING"
                )
              }
              className="h-[44px] w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="MOST_RECENT">Most Recent</option>
              <option value="OLDEST">Oldest</option>
              <option value="PAST">Past</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-black font-sans max-h-[550px] overflow-y-auto">
          {/* Events Table */}
          <table className="w-full border-white-700 text-bcp-blue">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">
                <th className="py-3 px-5 font-normal"></th>
                <th className="py-3 pl-5 px-4 font-normal">Event Name</th>
                <th className="py-3 px-4 font-normal">Start Date</th>
                <th className="py-3 px-4 font-normal">Capacity</th>
                <th className="py-3 px-4 pl-13 font-normal">
                  <button
                    onClick={toggleSelectAll}
                    className="hover:underline transition-all duration-200 "
                  >
                    Select All
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEvents.map((event, i) => {
                const rowNumber = i + 1;

                return (
                  <tr
                    key={event.id}
                    className={`transition-colors duration-200 ${
                      event.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                    } border-t border-gray-300`}
                  >
                    <td className="py-3 px-6">{rowNumber}</td>
                    <td className="py-3 px-4">{event.name}</td>
                    <td className="py-3 px-4">
                      {event.startTime.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">{event.capacity}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={event.selected}
                        onChange={() => toggleSelect(event.id)}
                        className="w-5 h-5 accent-bcp-blue cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t w-full">
          <div className="flex justify-between py-6">
            <div className="flex justify-between gap-4">
              <Button
                disabled={selectedCount <= 0}
                label="Copy Event"
                altStyle="bg-[#f4f4f4] text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={() => {}}
              />
              <Button
                disabled={selectedCount <= 0}
                label="Save as CSV"
                altStyle="bg-[#f4f4f4] text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={() => {}}
              />
            </div>
            <div className="flex justify-between gap-4">
              <Button
                disabled={selectedCount <= 0}
                label="Remove"
                altStyle="bg-bcp-blue text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageEventsPage;