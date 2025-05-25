"use client";
import { useState, useEffect, useCallback } from "react";
import { showToast } from "../utils/toast";
import { formatDistance } from "date-fns";

export function useGroupPosts(groupId) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  // Format dữ liệu trả về từ API
  const formatPostData = useCallback((apiPosts) => {
    return apiPosts.map((post) => ({
      id: post.postId,
      userId: post.userId,
      user: post.userName || "User",
      avatar: post.userAvatar || "/person.png",
      content: post.content,
      media: post.media
        ? post.media.map(({ mediaUrl, mediaType }) => ({
            url: mediaUrl,
            type: mediaType,
          }))
        : [],
      likes: post.voteCount,
      comments: post.commentCount,
      time: formatDistance(new Date(post.postedAt), new Date(), {
        addSuffix: true,
      }),
      isLiked: post.isVotedByCurrentUser,
      postedAt: post.postedAt,
    }));
  }, []);

  // Hàm tải dữ liệu từ API
  const fetchGroupPosts = useCallback(
    async (refresh = false) => {
      if (!groupId || isLoading) return;

      const currentPage = refresh ? 1 : page;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/proxy/group-posts/${groupId}?page=${currentPage}&pageSize=${pageSize}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Không thể tải bài đăng");

        setHasMore(data.length >= pageSize);
        const formattedPosts = formatPostData(data);

        setPosts((prevPosts) =>
          refresh ? formattedPosts : [...prevPosts, ...formattedPosts]
        );
        if (!refresh) setPage((prev) => prev + 1);
      } catch (error) {
        console.error("Lỗi tải bài đăng nhóm:", error);
        setError(error.message);
        showToast(error.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [groupId, page, formatPostData]
  );

  // Hàm tải thêm bài đăng (cuộn vô hạn)
  const loadMorePosts = useCallback(() => {
    if (hasMore && !isLoading) fetchGroupPosts();
  }, [hasMore, isLoading, fetchGroupPosts]);

  // Làm mới danh sách bài đăng
  const refreshPosts = useCallback(() => {
    fetchGroupPosts(true);
  }, [fetchGroupPosts]);

  // Thêm bài đăng mới vào danh sách
  const addPost = useCallback((newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  // Chỉ tải dữ liệu **khi groupId thay đổi**
  useEffect(() => {
    if (groupId) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchGroupPosts(true);
    }
  }, [groupId]); // Giảm dependencies để tránh gọi lại không cần thiết

  return {
    posts,
    isLoading,
    error,
    hasMore,
    loadMorePosts,
    refreshPosts,
    addPost,
  };
}
