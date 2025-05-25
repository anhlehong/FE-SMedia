"use client";
import { useState, useEffect } from "react";
import { isAuthenticated } from "../utils/auth";

export default function useMyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchGroups() {
      if (!isAuthenticated()) {
        setError("Bạn cần đăng nhập để xem danh sách nhóm");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/proxy/groups/my-groups", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(
            `Lỗi ${response.status}: Không thể lấy danh sách nhóm`
          );
        }

        const data = await response.json();
        setGroups(data);
      } catch (err) {
        console.error("Lỗi lấy danh sách nhóm:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [refreshTrigger]); // Gọi lại API khi refreshTrigger thay đổi

  // Hàm cập nhật danh sách nhóm khi có nhóm mới hoặc tham gia nhóm
  const refreshGroups = () => {
    console.log("Refreshing groups...");

    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    groups,
    loading,
    error,
    refreshGroups,
  };
}
