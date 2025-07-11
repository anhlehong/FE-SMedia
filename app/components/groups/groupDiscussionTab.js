"use client";
import React, { memo } from "react";
import FeedSection from "@/app/components/feed/feedSection";
import PostCardGroup from "./postCardGroup";
import GroupCreatePost from "@/app/components/groups/groupCreatePost";
import { showToast } from "@/app/utils/toast";
import { useGroupPosts } from "@/app/hooks/useGroupPosts";
import InfiniteScroll from "react-infinite-scroll-component";

export default function GroupDiscussionTab({ isMember, groupId, isAdmin }) {
  if(!isMember){
    return (
      <NonMemberView formattedPosts={[]} loading={false} />
    );
  }
  // WARNING: useGroupPosts should be placed first
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
      {error ? (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          <p>Đã xảy ra lỗi khi tải bài đăng. Vui lòng thử lại sau!</p>
        </div>
      ): 

      ( 
        <>
          <div className="mb-4">
            <GroupCreatePost
              groupId={groupId}
              onPostCreated={handleAddNewPost}
              refreshPosts={refreshPosts}
              isAdmin={isAdmin}
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
                    <PostCardGroup
                      key={post.id}
                      post={post}
                      onLike={() => handleLike(post.id)}
                      isAdmin={isAdmin}
                      refreshPosts={refreshPosts}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <EmptyState />
            )}
          </div>
        </>
       
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

// const NonMemberView = ({ formattedPosts, loading }) => (
//   <div className="space-y-6 mt-3">
//     {loading && formattedPosts.length === 0 ? (
//       <LoadingIndicator />
//     ) : formattedPosts.length > 0 ? (
//       formattedPosts.map((post) => <PostCard key={post.id} post={post} />)
//     ) : (
//       <EmptyState />
//     )}
//     {loading && formattedPosts.length > 0 && <LoadingIndicator />}
//   </div>
// );
const NonMemberView = ({ formattedPosts, loading }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-3">
    <div className="text-center max-w-md">
      {/* Icon */}
      <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-8 h-8 text-blue-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          />
        </svg>
      </div>
      
      {/* Message */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Yêu cầu thành viên
      </h3>
      <p className="text-gray-600 mb-4">
        Bạn cần là thành viên của nhóm để có thể xem và tham gia thảo luận
      </p>
      
      
    </div>
  </div>
);