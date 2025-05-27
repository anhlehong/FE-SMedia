"use client";
import Image from "next/image";
import { formatDistance } from "date-fns";
import { getUserInfo } from "@/app/utils/auth";
import { PencilSquareIcon, ArrowRightOnRectangleIcon, TrashIcon } from "@heroicons/react/24/outline";
import EditGroupModal from "./EditGroupModal";
import { useState } from "react";
import { showToast } from "@/app/utils/toast";
import { useRouter } from "next/navigation";

export default function GroupHeader({
  groupDetails,
  isMember,
  isJoining,
  fetchGroupDetails,
  handleJoinPublicGroup,
  handleJoinPrivateGroup,
  activeTab,
  setActiveTab,
  isAdmin = false
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const router = useRouter();

  // Get current user info
  const userInfo = getUserInfo();
  const currentUserId = userInfo ? userInfo.userId : null;

  // Format the creation date for display
  const formatCreationDate = (dateString) => {
    try {
      return formatDistance(new Date(dateString), new Date(), {
        addSuffix: true,
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Unknown date";
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    const confirmMessage = `Bạn có chắc chắn muốn rời khỏi nhóm "${groupDetails.groupName}" không?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLeavingGroup(true);
    try {
      const response = await fetch(`/api/proxy/group-members?groupId=${groupDetails.groupId}&userId=${currentUserId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể rời khỏi nhóm");
      }

      showToast("Bạn đã rời khỏi nhóm thành công", "success");
      
      // Redirect to groups page after leaving
      router.push("/groups");
    } catch (error) {
      console.error("Error leaving group:", error);
      showToast("Không thể rời khỏi nhóm, vui lòng thử lại", "error");
    } finally {
      setIsLeavingGroup(false);
    }
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa nhóm "${groupDetails.groupName}" không?\n\nHành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu của nhóm bao gồm bài viết, thành viên và tất cả thông tin liên quan.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Second confirmation for critical action
    const secondConfirm = window.confirm("Bạn có thực sự chắc chắn? Điều này không thể được hoàn tác!");
    if (!secondConfirm) {
      return;
    }

    setIsDeletingGroup(true);
    try {
      const response = await fetch(`/api/proxy/group/${groupDetails.groupId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể xóa nhóm");
      }

      showToast("Nhóm đã được xóa thành công", "success");
      
      // Redirect to groups page after successful deletion
      router.push("/groups");
    } catch (error) {
      console.error("Error deleting group:", error);
      showToast("Không thể xóa nhóm, vui lòng thử lại", "error");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      {/* Cover photo */}
      <div className="h-80 relative bg-gray-200 ">
        <Image
          src={groupDetails.image || "/group.jpg"}
          alt={groupDetails.groupName}
          fill
          className="object-cover"
          priority
          onError={() => {
            console.log("Image load error, replacing with fallback");
          }}
        />
        {isAdmin && (
          <div className="absolute bottom-3 right-6 flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-400 shadow-md rounded-md font-medium transition-colors"
            >
              <PencilSquareIcon className="w-5 h-5 mr-2" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDeleteGroup}
              disabled={isDeletingGroup}
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white shadow-md rounded-md font-medium transition-colors"
              title="Xóa nhóm"
            >
              {isDeletingGroup ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Xóa nhóm
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Group info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{groupDetails.groupName}</h1>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <span
                className={`mr-2 w-2 h-2 rounded-full ${
                  groupDetails.visibility.toLowerCase() === "public"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              ></span>
              Nhóm công khai • {groupDetails.memberCount.toLocaleString()}{" "}
              thành viên
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created {formatCreationDate(groupDetails.createdAt)}
            </p>
          </div>

          {isMember ? (
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md">
                Đã tham gia
              </button>
              {/* Leave Group Button - Only show if user is not the admin/creator */}
              {!isAdmin && (
                <button
                  onClick={handleLeaveGroup}
                  disabled={isLeavingGroup}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-md flex items-center gap-2 transition-colors"
                  title="Rời khỏi nhóm"
                >
                  {isLeavingGroup ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang rời...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Rời nhóm</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : groupDetails.visibility.toLowerCase() === "public" ? (
            <button
              onClick={handleJoinPublicGroup}
              disabled={isJoining}
              className={`px-4 py-1.5 ${
                isJoining ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white rounded-md flex items-center gap-2`}
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tham gia...</span>
                </>
              ) : (
                "Tham gia ngay"
              )}
            </button>
          ) : (
            <button
              onClick={handleJoinPrivateGroup}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Yêu cầu tham gia
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t">
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === "discussion"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("discussion")}
          >
            Bài viết
          </button>
          
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === "about"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("about")}
          >
            Giới thiệu
          </button>
          {/* Only show admin tabs if user is admin */}
          {isAdmin && (
            <>
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === "members"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("members")}
              >
                Members
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === "report"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("report")}
              >
                Báo cáo
              </button>

              <button
                className={`px-4 py-3 font-medium text-sm ${
                  activeTab === "pendingPosts"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("pendingPosts")}
              >
                Bài viết đang chờ duyệt
              </button>
            </>
          )}
        </div>
      </div>
      {isModalOpen && (
        <EditGroupModal
          groupData={groupDetails}
          fetchGroupDetails={fetchGroupDetails}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
