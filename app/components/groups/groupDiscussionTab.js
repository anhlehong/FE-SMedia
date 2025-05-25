"use client";
import React, { memo } from "react";
import FeedSection from "@/app/components/feed/feedSection";
import PostCard from "@/app/components/feed/postCardWithMedia";
import GroupCreatePost from "@/app/components/groups/groupCreatePost";
import { showToast } from "@/app/utils/toast";
import { useGroupPosts } from "@/app/hooks/useGroupPosts";
import InfiniteScroll from "react-infinite-scroll-component";

export default function GroupDiscussionTab({ isMember, groupId }) {
  const {
    posts,
    isLoading: loading,
    error,
    hasMore,
    loadMorePosts,
    refreshPosts,
  } = useGroupPosts(groupId);

  // Xử lý bài đăng để đảm bảo media đúng định dạng
  const formattedPosts = Array.isArray(posts)
    ? posts.map((post) => {
        const formattedPost = { ...post };

        if (post.media && Array.isArray(post.media)) {
          formattedPost.media = post.media.map((item) => ({
            mediaType: item.mediaType || item.type || "unknown",
            mediaUrl: item.mediaUrl || item.url || "",
          }));
        } else if (post.image) {
          formattedPost.media = [{ mediaType: "image", mediaUrl: post.image }];
        }

        return formattedPost;
      })
    : [];

  console.log("Formatted posts:", formattedPosts);

  const handleAddNewPost = () => {
    refreshPosts?.();
  };

  const handleLike = (postId) => {
    fetch(`/api/posts/${postId}/like`, { method: "POST" })
      .then(() => showToast("Đã thích bài đăng!"))
      .catch(() => showToast("Có lỗi xảy ra!"));
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          <p>Đã xảy ra lỗi khi tải bài đăng. Vui lòng thử lại sau!</p>
        </div>
      )}

      {isMember ? (
        <>
          <div className="mb-4">
            <GroupCreatePost
              groupId={groupId}
              onPostCreated={handleAddNewPost}
              refreshPosts={refreshPosts}
            />
          </div>
          <div className="mt-4">
            {loading && formattedPosts.length === 0 ? (
              <LoadingIndicator />
            ) : formattedPosts.length > 0 ? (
              <InfiniteScroll
                dataLength={formattedPosts.length}
                next={loadMorePosts}
                hasMore={hasMore}
                loader={<LoadingIndicator />}
                endMessage={<EndMessage />}
              >
                <div className="space-y-6">
                  {formattedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => handleLike(post.id)}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <EmptyState />
            )}
          </div>
        </>
      ) : (
        <NonMemberView formattedPosts={formattedPosts} loading={loading} />
      )}
    </div>
  );
}

const LoadingIndicator = () => (
  <div className="flex justify-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const EndMessage = () => (
  <p className="text-center text-gray-500 py-4">
    <b>Bạn đã xem tất cả bài đăng trong nhóm này.</b>
  </p>
);

const EmptyState = () => (
  <div className="bg-white rounded-lg shadow p-8 text-center">
    <p className="text-gray-500">Không có bài đăng nào trong nhóm này.</p>
    <p className="mt-2 text-gray-600">
      Hãy tạo bài đăng mới để bắt đầu cuộc thảo luận!
    </p>
  </div>
);

const NonMemberView = ({ formattedPosts, loading }) => (
  <div className="space-y-6 mt-3">
    {loading && formattedPosts.length === 0 ? (
      <LoadingIndicator />
    ) : formattedPosts.length > 0 ? (
      formattedPosts.map((post) => <PostCard key={post.id} post={post} />)
    ) : (
      <EmptyState />
    )}
    {loading && formattedPosts.length > 0 && <LoadingIndicator />}
  </div>
);
