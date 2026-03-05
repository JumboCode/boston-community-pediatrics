"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import Modal from "@/components/common/Modal";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { AdminUser } from "@/app/api/eventSignup/controller";
import { deleteEvent } from "@/app/api/events/controller";

interface EventProps {
  eventId: string;
  positionId: string;
  eventName: string;
  startDate: Date;
  endDate: Date;
  filledSlots: number;
  totalSlots: number;
  selected: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
};

const ManageEventsPage = (props: EventProps) => {
  
  const { positionId } = props;
  const { user } = useUser();
  const currenteventId = user?.id;
  const [event, setEvent] = useState<EventProps[]>([]);
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const router = useRouter();

  // Fetch event information 
  const { data: allVols } = useSWR<AdminUser[]>(`/api/events`, fetcher);

  // Fetch eventSignup info for filled slots/total slots
    const { data: signups } = useSWR<AdminUser[]>(
    positionId ? `/api/eventSignup?positionId=${positionId}` : null,
    fetcher
  );

  const events = useMemo(() => {
    if (!allVols) return [];
    return allVols
      .map((v: any) => ({
        eventId: v.id || v.eventId,
        eventName: v.name,
        startDate: new Date(v.startTime), 
        endDate: new Date(v.endTime),
        filledSlots: 8, // inside eventposition
        totalSlots: 9,
        selected: false,
      }))
      .sort((a, b) => {
        const dateCompare = a.startDate.getTime() - b.startDate.getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.eventName.toLowerCase().localeCompare(b.eventName.toLowerCase());
      });
  }, [allVols]);

  useEffect(() => {
    setEvent(events);
  }, [events]);

  // Event selection (toggle by `eventId`)
  const toggleSelect = (id?: string) => {
    if (!id || id === currenteventId) return;

    setEvent((prev) =>
      prev.map((v) => (v.eventId === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = event
      .filter((v) => v.eventId !== currenteventId)
      .every((v) => v.selected);
    setEvent((prev) =>
      prev.map((v) =>
        v.eventId === currenteventId ? v : { ...v, selected: !allSelected }
      )
    );
  };

  const selectedCount = event.filter((v) => v.selected).length;

  const closeModal = useCallback(() => {
    setModalTitle(null);
    setModalMessage(null);
    router.refresh();
  }, [router]);

  // Delete Event - show confirmation first
  const handleDeleteConfirm = () => {
    setPendingCount(selectedCount);
    setShowDeleteConfirm(true);
  };

  const handleDeleteApproved = async () => {
    setIsLoading(true);
    const eventToDel: EventProps[] = event.filter(
      (v) => v.selected && v.eventId !== currenteventId
    );

    if (eventToDel.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const deletePromises = eventToDel.map(async (vol) => {
        const res = await fetch(`/api/admin/events/${vol.eventId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: vol.eventId }),
        });

        if (!res.ok) {
          throw new Error(`Failed to delete event`);
        }

        return vol.eventId;
      });

      await Promise.all(deletePromises);

      // Remove all selected entries from state
      setEvent((prev) => prev.filter((v) => !v.selected));

      // Show success modal
      setShowDeleteConfirm(false);
      setModalTitle("Event(s) Removed!");
      setModalMessage("Event(s) successfully removed");
    } catch {
      setShowDeleteConfirm(false);
      setModalTitle("Error");
      setModalMessage("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

//   // Edit roles - show confirmation first
//   const handleEditConfirm = () => {
//     setPendingCount(selectedCount);
//     setShowEditConfirm(true);
//   };

//   const handleEditApproved = async () => {
//     setIsLoading(true);
//     const eventToEdit: EventProps[] = event.filter(
//       (v) => v.selected && v.eventId !== currenteventId
//     );

//     if (eventToEdit.length === 0) {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const editPromises = eventToEdit.map(async (vol) => {
//         const res = await fetch(`/api/admin/users/${vol.eventId}/role`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             id: vol.eventId,
//             role: vol.role === "ADMIN" ? "VOLUNTEER" : "ADMIN",
//           }),
//         });

//         if (!res.ok) {
//           throw new Error(`Failed to update role`);
//         }

//         return vol.eventId;
//       });

//       await Promise.all(editPromises);

//       setEvent((prev) =>
//         prev.map((v) => ({
//           ...v,
//           role: v.selected
//             ? v.role === "ADMIN"
//               ? "VOLUNTEER"
//               : "ADMIN"
//             : v.role,
//         }))
//       );

//       // Show success modal
//       setShowEditConfirm(false);
//       setModalTitle("Roles Updated!");
//       setModalMessage("Role successfully assigned!");
//     } catch {
//       setShowEditConfirm(false);
//       setModalTitle("Error");
//       setModalMessage("Failed to update roles. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

  return (
    <>
      <div className="items-center justify-center p-6 ml-60 mr-60">
        <h1 className="text-[16px] font-semibold mb-6 text-bcp-blue">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <Link href="/admin/manage/events" className="hover:underline">
            Manage Events
          </Link>
        </h1>
        <div className="bg-white border border-black font-sans max-h-[550px] overflow-y-auto">
          {/* Volunteer Table (populated by `/api/users`) */}
          <table className="w-full border-white-700 text-bcp-blue">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">

                <th className="py-3 pl-8 px-4 font-normal">Events</th>
                <th className="py-3 px-4 font-normal">Date</th>
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
              {event.map((p, i) => {           
                const rowNumber = i + 1;

                return (
                  <tr
                    key={p.eventId}
                    className={`transition-colors duration-200 ${
                      p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                    } border-t border-gray-300`}
                  >
                    <td className="py-3 px-4 pl-8">
                        <Link
                            href={`/event/${p.eventId}`}
                            className="hover:underline"
                        >
                            {p.eventName}
                        </Link>
                    </td>
                    <td className="py-3 px-4">
                        {p.startDate.getFullYear() === p.endDate.getFullYear() &&
                        p.startDate.getMonth() === p.endDate.getMonth() &&
                        p.startDate.getDate() === p.endDate.getDate()
                            ? p.startDate.toLocaleDateString()
                            : `${p.startDate.toLocaleDateString()} - ${p.endDate.toLocaleDateString()}`}
                    </td>
                    <td className="py-3 px-4">{8}/{9}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.selected}
                        onChange={() => toggleSelect(p.eventId)}
                        disabled={p.eventId === currenteventId}
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
              />
              <Button
                disabled={selectedCount <= 0}
                label="Save as CSV"
                altStyle="bg-[#f4f4f4] text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
              />
            </div>
            <div className="flex justify-between gap-4">
              <Button
                disabled={selectedCount <= 0}
                label="Remove"
                altStyle="bg-bcp-blue text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                onClick={handleDeleteConfirm}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Confirmation Modal */}
      {/* {showEditConfirm && (
        <Modal
          open={showEditConfirm}
          title="Confirm Role Change"
          message={`Are you sure you want to change roles for ${pendingCount} people?`}
          onClose={() => setShowEditConfirm(false)}
          buttons={[
            {
              label: "Cancel",
              variant: "secondary",
              onClick: () => setShowEditConfirm(false),
              disabled: isLoading,
            },
            {
              label: "Confirm",
              variant: "primary",
              onClick: handleEditApproved,
              disabled: isLoading,
            },
          ]}
        />
      )} */}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          open={showDeleteConfirm}
          title={`Remove ${pendingCount} event${pendingCount === 1 ? "" : "s"}?`}
        //   message={`Remove ${pendingCount} event${pendingCount === 1 ? "" : "s"}?`}
          onClose={() => setShowDeleteConfirm(false)}
          buttons={[
            {
              label: "Cancel",
              variant: "secondary",
              onClick: () => setShowDeleteConfirm(false),
              disabled: isLoading,
            },
            {
              label: "Remove",
              variant: "primary",
              onClick: () => handleDeleteApproved(),
              disabled: isLoading,
            },
          ]}
        />
      )}

      {/* Success/Error Modal */}
      {modalMessage && modalTitle && (
        <Modal
          open={true}
          title={modalTitle}
          message={modalMessage}
          onClose={closeModal}
          buttons={[
            {
              label: "Done",
              variant: "primary",
              onClick: closeModal,
            },
          ]}
        />
      )}
    </>
  );
};

export default ManageEventsPage;
