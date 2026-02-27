"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import Modal from "@/components/common/Modal";
import Link from "next/link";

interface FrontEndUser {
  userId: string;
  signUpId?: string;
  waitlistId?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  selected: boolean;
}

const ManageRolesPage = () => {
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  };

  // Fetch signups for the position (volunteers)
  const { data: allVols } = useSWR<FrontEndUser[]>(`/api/users`, fetcher);

  const frontEndUsers = useMemo(() => {
    if (!allVols) return [];

    return allVols.map((v: any) => ({
      userId: v.id || v.userId,
      firstName: v.firstName,
      lastName: v.lastName,
      emailAddress: v.emailAddress,
      phoneNumber: v.phoneNumber,
      role: v.role,
      selected: false,
    }));
  }, [allVols]);

  const [volunteers, setVolunteers] = useState<FrontEndUser[]>([]);
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    setVolunteers(frontEndUsers);
  }, [frontEndUsers]);

  // Volunteer selection (toggle by `userId`)
  const toggleSelect = (id?: string) => {
    if (!id) return;

    setVolunteers((prev) =>
      prev.map((v) => (v.userId === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = volunteers.every((v) => v.selected);
    setVolunteers((prev) =>
      prev.map((v) => ({ ...v, selected: !allSelected }))
    );
  };

  const anySelected = volunteers.some((v) => v.selected);
  const selectedCount = volunteers.filter((v) => v.selected).length;

  const closeModal = useCallback(() => {
    setModalTitle(null);
    setModalMessage(null);
    router.refresh();
  }, [router]);

  // Delete User - show confirmation first
  const handleDeleteConfirm = () => {
    setPendingCount(selectedCount);
    setShowDeleteConfirm(true);
  };

  const handleDeleteApproved = async () => {
    setIsLoading(true);
    const volunteersToDel: FrontEndUser[] = volunteers.filter(
      (v) => v.selected === true
    );

    if (volunteersToDel.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const deletePromises = volunteersToDel.map(async (vol) => {
        const res = await fetch("/api/users", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: vol.userId }),
        });

        if (!res.ok) {
          throw new Error(`Failed to delete user`);
        }

        return vol.userId;
      });

      await Promise.all(deletePromises);

      // Remove all selected entries from state
      setVolunteers((prev) => prev.filter((v) => !v.selected));

      // Show success modal
      setShowDeleteConfirm(false);
      setModalTitle("Users Removed!");
      setModalMessage("Users successfully removed");
    } catch {
      setShowDeleteConfirm(false);
      setModalTitle("Error");
      setModalMessage("Failed to delete user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit roles - show confirmation first
  const handleEditConfirm = () => {
    setPendingCount(selectedCount);
    setShowEditConfirm(true);
  };

  const handleEditApproved = async () => {
    setIsLoading(true);
    const volunteersToEdit: FrontEndUser[] = volunteers.filter(
      (v) => v.selected === true
    );

    if (volunteersToEdit.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const editPromises = volunteersToEdit.map(async (vol) => {
        const res = await fetch(
          `/api/admin/users/${vol.userId}/role`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: vol.userId,
              role: vol.role === "ADMIN" ? "VOLUNTEER" : "ADMIN",
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to update role`);
        }

        return vol.userId;
      });

      await Promise.all(editPromises);

      setVolunteers((prev) =>
        prev.map((v) => ({
          ...v,
          role: v.selected
            ? v.role === "ADMIN"
              ? "VOLUNTEER"
              : "ADMIN"
            : v.role,
        }))
      );

      // Show success modal
      setShowEditConfirm(false);
      setModalTitle("Roles Updated!");
      setModalMessage("Role successfully assigned!");
    } catch {
      setShowEditConfirm(false);
      setModalTitle("Error");
      setModalMessage("Failed to update roles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-[16px] font-semibold mb-6 text-[#234254]">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {" / "}
        <Link href="/admin/manage" className="hover:underline">
          Manage Roles
        </Link>
      </h1>
      <div className="items-center justify-center p-6 ml-60 mr-60">
        <div className="bg-white border border-black font-sans">
          {/* Volunteer Table (populated by `/api/users`) */}
          <table className="w-full border-white-700 text-[#234254]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">
                <th className="py-3 px-5 font-normal"></th>
                <th className="py-3 pl-5 px-4 font-normal">Name</th>
                <th className="py-3 px-4 font-normal">Role</th>
                <th className="py-3 px-4 font-normal">Email</th>
                <th className="py-3 px-4 pr-5 font-normal">Phone Number</th>
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
              {volunteers.map((p, i) => {
                const rowNumber = i + 1;

                return (
                  <tr
                    key={p.userId}
                    className={`transition-colors duration-200 ${
                      p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                    } border-t border-gray-300`}
                  >
                    <td className="py-3 px-6">{rowNumber}</td>
                    <td className="py-3 px-4">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="py-3 px-4">{p.role}</td>
                    <td className="py-3 px-4">{p.emailAddress}</td>
                    <td className="py-3 px-4">{p.phoneNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.selected}
                        onChange={() => toggleSelect(p.userId)}
                        className="w-5 h-5 accent-[#234254] cursor-pointer"
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
                label="Message"
                altStyle="bg-F4F4F4-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
              />
              <Button
                label="Copy to Clipboard"
                altStyle="bg-F4F4F4-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
              />
              <Button
                label="Save as CSV"
                altStyle="bg-F4F4F4-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
              />
            </div>
            <div className="flex justify-between gap-4">
              <Button
                label="Change Role"
                altStyle="bg-F4F4F4-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleEditConfirm}
              />

              <Button
                label="Remove"
                altStyle="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                onClick={handleDeleteConfirm}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Confirmation Modal */}
      {showEditConfirm && (
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          open={showDeleteConfirm}
          title="Confirm Removal"
          message={`remove (${pendingCount}) users?`}
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
              variant: "danger",
              onClick: handleDeleteApproved,
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

export default ManageRolesPage;
