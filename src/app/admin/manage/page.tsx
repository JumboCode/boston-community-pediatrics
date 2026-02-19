"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import { AdminUser } from "@/app/api/eventSignup/controller";
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

  // Delete User
  const handleDelete = async () => {
    const volunteersToDel: FrontEndUser[] = volunteers.filter(
      (v) => v.selected === true
    );

    if (volunteersToDel.length === 0) return;

    try {
      const deletePromises = volunteersToDel.map(async (vol) => {
        const res = await fetch(`/api/users?id=${vol.userId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error(`Failed to delete user`);
        }

        return vol.userId;
      });

      await Promise.all(deletePromises);

      // Remove all selected entries from state (both parents and guests)
      setVolunteers((prev) => prev.filter((v) => !v.selected));

      router.refresh();
    } catch {
      alert(`Error: Failed to delete user`);
    }
  };

  const handleEdit = async () => {
    const volunteersToDel: FrontEndUser[] = volunteers.filter(
      (v) => v.selected === true
    );

    if (volunteersToDel.length === 0) return;

    try {
      const editPromises = volunteersToDel.map(async (vol) => {
        const res = await fetch(`/api/admin/users/${vol.userId}/role?id=${vol.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            
            id: vol.userId, // <--- IMPORTANT: Using Clerk ID as DB ID
            role: vol.role === "ADMIN" ? "VOLUNTEER" : "ADMIN", // Toggle role
            
          }),
        });
        // const res = await fetch(`/api/admin/users/${vol.userId}/role?id=${vol.userId}`, {
        //   method: "GET",
        // });

        if (!res.ok) {
          throw new Error(`Failed to delete user`);
        }

        return vol.userId;
      });

      await Promise.all(editPromises);

      // Remove all selected entries from state (both parents and guests)
      setVolunteers((prev) => prev.filter((v) => !v.selected));

      router.refresh();
    } catch {
      alert(`Error: Failed to delete user`);
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
      <div className="min-w-[1100px] flex items-center justify-center p-6">
        <div className="w-full max-w-[996px] bg-white border border-black font-sans">
          {/* Volunteer Table (populated by `/api/users`) */}
          <table className="w-full border-white-700 text-[#234254]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">
                <th className="py-3 px-5 font-normal"></th>
                <th className="py-3 pl-29 px-4 font-normal">Name</th>
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

          {/* Selection Buttons */}
          {anySelected && (
            <div className="border-t border-gray-200 bg-gray-50 w-full">
              <div className="flex justify-between px-6 py-4">
                <div>
                  <Button
                    label="Message"
                    altStyle="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                  />
                </div>
                <div className="flex items-center">
                  <div className="mr-[5px]">
                    <Button
                      label="Change Role"
                      altStyle="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                      onClick={handleEdit}
                    />
                  </div>
                  <div>
                    <Button
                      label="Remove"
                      altStyle="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                      onClick={handleDelete}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageRolesPage;
