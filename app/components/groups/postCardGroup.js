"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { showToast } from "../../utils/toast";
import useComment from "../../hooks/useComment";
import useVote from "../../hooks/useVote";
import {
  HandThumbUpIcon as OutlineThumbUp,
  ChatBubbleOvalLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as SolidThumbUp } from "@heroicons/react/24/solid";

export default function PostCardGroup({ post, onLike, isAdmin, refreshPosts }) {
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Use our comments hook
  const {
    comments,
    comment,
    setComment,
    replyTo,
    isLoadingComments,
    handleAddComment,
    handleReply,
    cancelReply,
    toggleComments,
    formatRelativeTime,
  } = useComment({
    postId: post.id,
    initialComments: [],
  });

  // Use our vote hook
  const { isVoted, voteCount, toggleVote, updateVoteState } = useVote({
    postId: post.id,
    initialVoted: post.isLiked,
    initialVoteCount: post.likes,
    onVoteChange: () => onLike(post.id), // Sync with parent state via callback
  });

  // Update local vote state when post prop changes
  useEffect(() => {
    updateVoteState(post.isLiked, post.likes);
  }, [post.isLiked, post.likes]);

  // Recursive comment component for rendering comments at any nesting level
  const Comment = ({ comment, nestLevel = 0 }) => {
    const maxNestLevel = 5; // Maximum nesting level to prevent too deep nesting
    const currentNestLevel = Math.min(nestLevel, maxNestLevel);

    // Handle both text and content fields (API returns content, our local state uses text)
    const commentImg = comment.image;
    const commentText = comment.content || comment.text;
    const commentUser = comment.user || "Người dùng không xác định";
    const commentTime = comment.time || formatRelativeTime(comment.postedAt);

    return (
      <div
        className={`comment-thread ${comment.isOptimistic ? "opacity-70" : ""}`}
      >
        <div className="flex">
          {/* <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0">
                    </div> */}
          <div className="mr-2">
            <img
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-100 shadow-sm group-hover:border-blue-100 transition-colors"
              src={commentImg || "/person.png"}
              alt={commentUser}
            />
          </div>
          <div className="flex-1">
            <div
              className={`bg-gray-100 rounded-2xl py-2 px-3 max-w-[95%] ${
                comment.isOptimistic ? "border border-blue-200" : ""
              }`}
            >
              <p className="font-semibold text-sm">{commentUser}</p>
              <p>{commentText}</p>
              <p className="text-xs text-gray-500 mt-1">
                {commentTime}
                {comment.isOptimistic && (
                  <span className="text-blue-500 ml-2">Đang gửi...</span>
                )}
              </p>
            </div>

            {!comment.isOptimistic && (
              <button
                onClick={() => handleReply(comment.id, commentUser)}
                className="text-xs text-gray-500 mt-1 ml-2 hover:text-blue-500"
              >
                Trả lời
              </button>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-10 mt-2 space-y-3">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                nestLevel={currentNestLevel + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get file icon based on extension
  const getFileIcon = (fileName) => {
    if (!fileName) return "📎";

    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      default:
        return "📎";
    }
  };

  // Function to toggle comments and load them if needed
  const handleToggleComments = async () => {
    const newShowComments = await toggleComments(showComments);
    setShowComments(newShowComments);
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/proxy/post/${post.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể xóa bài viết");
      }

      showToast("Bài viết đã được xóa thành công", "success");

      // Call parent callback to refresh posts
      refreshPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("Không thể xóa bài viết, vui lòng thử lại", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      {/* Post header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden relative">
            <Image
              src={post.avatar || "/person.png"}
              alt={post.user}
              width={40}
              height={40}
              className="object-cover"
              unoptimized={post.avatar && post.avatar.startsWith("blob:")}
            />
          </div>
          <div>
            <Link href={`/user/${post.userId}`}>
              <h3 className="font-semibold hover:underline">{post.user}</h3>
            </Link>
            <div className="flex items-center">
              <Link href={`/post/${post.id}`}>
                <p className="text-xs text-gray-500 hover:underline">
                  {post.time}
                </p>
              </Link>
              {post.location && (
                <span className="text-xs text-gray-500 ml-2">
                  • {post.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Admin delete button */}
        {isAdmin && (
          <button
            onClick={handleDeletePost}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
            title="Xóa bài viết"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
            ) : (
              <TrashIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Post content */}
      <div className="mb-4">
        <Link href={`/post/${post.id}`}>
          <p className="mb-3 hover:text-blue-700 cursor-pointer">
            {post.content}
          </p>
        </Link>

        {/* Display tags if available */}
        {/* {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                            <span 
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )} */}

        {/* Handle media array format with improved debugging */}
        {post.media && post.media.length > 0 && (
          <div className="post-media-container">
            {post.media.map((media, index) => {
              // Debug output for problematic media items
              if (!media.mediaUrl) {
                console.warn("Media item missing URL:", media);
                return null;
              }

              // Handle image media type
              if (media.mediaType === "image") {
                return (
                  <Link href={`/post/${post.id}`} key={index}>
                    <div className="relative w-full h-auto rounded-lg overflow-hidden max-h-96 cursor-pointer mb-3">
                      <Image
                        src={media.mediaUrl}
                        alt="Hình ảnh bài viết"
                        width={600}
                        height={400}
                        className="w-full h-auto rounded-lg object-cover max-h-96 hover:opacity-95"
                        unoptimized={
                          media.mediaUrl.startsWith("blob:") ||
                          media.mediaUrl.startsWith("data:")
                        }
                      />
                    </div>
                  </Link>
                );
              }
              // Handle document media type
              else if (media.mediaType === "document") {
                // Extract filename from URL for display
                const fileName = media.mediaUrl.split("/").pop();

                // Determine the document type based on extension
                let icon = "📄";
                let documentType = "Tài liệu";

                if (fileName) {
                  const extension = fileName.split(".").pop().toLowerCase();

                  if (extension === "pdf") {
                    icon = "📄";
                    documentType = "Tài liệu PDF";
                  } else if (extension === "doc" || extension === "docx") {
                    icon = "📝";
                    documentType = "Tài liệu Word";
                  }
                }

                return (
                  <a
                    href={media.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                    className="flex items-center p-4 bg-gray-100 rounded-lg mb-3 hover:bg-gray-200 border border-gray-300"
                  >
                    <span className="text-3xl mr-4">{icon}</span>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-blue-600 truncate">
                        {fileName || "Tài liệu"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {documentType} - Nhấn để mở
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                );
              }
              // Unknown media type - show generic entry
              else {
                return (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded mb-3 border border-gray-200"
                  >
                    <span className="text-2xl mr-3">📎</span>
                    <span className="text-sm text-gray-600">
                      Tệp đính kèm ({media.mediaType || "không xác định"})
                      {media.mediaUrl && (
                        <a
                          href={media.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-500 hover:underline"
                        >
                          Mở
                        </a>
                      )}
                    </span>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Backward compatibility for the legacy image format */}
        {!post.media && post.image && (
          <Link href={`/post/${post.id}`}>
            <div className="relative w-full h-auto rounded-lg overflow-hidden max-h-96 cursor-pointer">
              <Image
                src={post.image}
                alt="Nội dung bài viết"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg object-cover max-h-96 hover:opacity-95"
                unoptimized={
                  post.image.startsWith("blob:") ||
                  post.image.startsWith("data:")
                }
              />
            </div>
          </Link>
        )}
      </div>

      {/* Post stats */}
      <div className="flex justify-between text-sm text-gray-500 mb-3">
        <div className="flex">
          <span
            className={`inline-block mr-1 ${
              isVoted ? "text-white bg-blue-500 rounded-full p-1" : ""
            }`}
          >
            {isVoted && <SolidThumbUp className="h-3 w-3" />}
          </span>
          {voteCount} {voteCount === 1 ? "lượt thích" : "lượt thích"}
        </div>
        <div className="flex">
          <span className="inline-block mr-1">
            <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
          </span>
          {/* {comments.length} {comments.length === 1 ? 'bình luận' : 'bình luận'} */}
          {post.comments} {post.comments === 1 ? "bình luận" : "bình luận"}
        </div>
      </div>

      {/* Post actions */}
      <div className="flex border-t border-b py-2 mb-3">
        <button
          onClick={toggleVote}
          className={`flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg ${
            isVoted ? "text-blue-500 font-medium" : ""
          }`}
          aria-label={isVoted ? "Bỏ thích" : "Thích bài viết này"}
        >
          <span className="mr-2" role="img" aria-label="vote">
            {isVoted ? (
              <SolidThumbUp className="h-5 w-5" />
            ) : (
              <OutlineThumbUp className="h-5 w-5" />
            )}
          </span>
          Thích
        </button>
        <button
          onClick={handleToggleComments}
          className="flex-1 flex items-center justify-center py-2 hover:bg-gray-100 rounded-lg"
        >
          <span className="mr-2">
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          </span>{" "}
          Bình luận
          {isLoadingComments && <span className="ml-1 animate-pulse">...</span>}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div>
          <div className="mb-3 space-y-3">
            {isLoadingComments ? (
              <div className="flex justify-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : comments.length > 0 ? (
              comments.map((topComment) => (
                <Comment key={topComment.id} comment={topComment} />
              ))
            ) : (
              <div className="text-center py-3 text-gray-500 text-sm">
                Hãy là người đầu tiên bình luận về bài viết này
              </div>
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex flex-col">
            {replyTo && (
              <div className="bg-blue-50 px-3 py-1 mb-2 rounded flex justify-between items-center">
                <span className="text-sm">
                  Đang trả lời{" "}
                  <span className="font-medium">{replyTo.userName}</span>
                </span>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex">
              <input
                type="text"
                placeholder={
                  replyTo
                    ? `Trả lời ${replyTo.userName}...`
                    : "Viết bình luận..."
                }
                className="flex-1 rounded-full bg-gray-100 px-4 py-2 mr-2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                autoFocus={!!replyTo}
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 disabled:bg-blue-300"
                disabled={!comment.trim()}
              >
                {replyTo ? "Trả lời" : "Đăng"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
