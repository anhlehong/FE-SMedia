"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import useMyGroups from "@/app/hooks/useMyGroups";

export default function LeftSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { groups, loading, error, refreshGroups } = useMyGroups();

  // Đóng sidebar trên màn hình lớn
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("Groups updated:", groups);
  }, [groups]);

  return (
    <>
      {/* Nút toggle sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 md:hidden bg-blue-500 text-white p-2 rounded-full shadow-lg"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay khi sidebar mở trên mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 fixed left-0 top-16 h-full p-4 overflow-y-auto bg-white transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:hidden lg:block`}
      >
        {/* <nav className="space-y-2">
          
        </nav>

        <div className="border-t border-gray-300 my-4"></div> */}

        {/* Danh sách nhóm */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-500 mb-2">Nhóm của bạn</h3>
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <Link
                    key={group.groupId}
                    href={`/group/${group.groupId}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="p-2 hover:bg-blue-50 rounded-md hover:text-blue-600">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={group.image || "/group.jpg"}
                          alt={group.groupName}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded mr-2 object-cover"
                          unoptimized={group.image ? false : true}
                        />
                        <span>{group.groupName}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">Bạn chưa tham gia nhóm nào.</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
