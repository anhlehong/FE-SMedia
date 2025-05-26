"use client";
import { useState, useEffect, useCallback } from "react";
import { getUserInfo } from "../utils/auth";
import { showToast } from "../utils/toast";

/**
 * Custom hook to fetch users that the current user is following
 * @returns {Object} Following users data and loading state
 */
export function useFollowing(take = 10) {
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  /**
   * Fetch users that the current user is following
   */
  const fetchFollowingUsers = useCallback(
    async (refresh = false) => {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.userId) {
        setFollowingUsers([]);
        setHasMore(false);
        return;
      }

      if (refresh) {
        setFollowingUsers([]);
        setHasMore(true);
      }

      setIsLoading(true);
      setError(null);

      try {
        const skipValue = refresh ? 0 : followingUsers.length;
        const response = await fetch(
          `/api/proxy/follow/following/${userInfo.userId}?skip=${skipValue}&take=${take}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch following users (${response.status})`
          );
        }

        const data = await response.json();
        setFollowingUsers((prev) => (refresh ? data : [...prev, ...data]));
        setHasMore(data.length === take);
      } catch (error) {
        console.error("Error fetching following users:", error);
        setError(error.message);
        showToast(error.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [take]
  );

  useEffect(() => {
    fetchFollowingUsers(true);
  }, [fetchFollowingUsers, refreshTrigger]);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => !prev);
  }, []);

  return {
    followingUsers,
    isLoading,
    error,
    hasMore,
    loadMore: () => fetchFollowingUsers(),
    refresh: () => fetchFollowingUsers(true),
    triggerRefresh,
  };
}

export default useFollowing;
