"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getAuthToken, isAuthenticated, getUserInfo } from "../utils/auth";
import { subscribe } from "../utils/events";

/**
 * Hook để lấy ảnh đại diện của người dùng hiện tại và cập nhật khi có thay đổi
 * @returns {Object} - URL avatar, trạng thái tải, lỗi, và hàm làm mới avatar
 */
export default function useUserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState("/avatar.png"); // Avatar mặc định
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch avatar từ API khi refreshTrigger thay đổi
  useEffect(() => {
    async function fetchUserAvatar() {
      if (typeof window === "undefined") return;
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        const { userId } = getUserInfo();
        console.log("Fetching user avatar for userId:", userId);

        const response = await axios.get(`/api/proxy/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200 && response.data?.image) {
          setAvatarUrl(response.data.image);
        }
      } catch (err) {
        console.error("Error fetching user avatar:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAvatar();
  }, [refreshTrigger]); // Avatar cập nhật khi refreshTrigger thay đổi

  // Lắng nghe sự kiện cập nhật avatar
  useEffect(() => {
    const unsubscribe = subscribe("avatar-updated", () => {
      refreshAvatar();
    });

    return () => unsubscribe();
  }, []);

  // Hàm cập nhật avatar thủ công
  const refreshAvatar = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    avatarUrl,
    loading,
    error,
    refreshAvatar,
  };
}
