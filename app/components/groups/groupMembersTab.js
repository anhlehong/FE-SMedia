"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { showToast } from "@/app/utils/toast";
import { TrashIcon } from "@heroicons/react/24/outline";
import { getUserInfo } from "@/app/utils/auth";

export default function GroupMembersTab({ groupDetails, isAdmin }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingMembers, setRemovingMembers] = useState(new Set());

  // Extract groupId from groupDetails
  const groupId = groupDetails.groupId;

  // Get current user info to determine permissions
  const userInfo = getUserInfo();
  const currentUserId = userInfo ? userInfo.userId : null;

  useEffect(() => {
    console.log("Group member",members);
},[members])
  useEffect(() => {
    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchGroupMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API call to get members in the group
      const response = await fetch(`/api/proxy/group-members?groupId=${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch group members");
      }

      const data = await response.json();
      
      // Filter out removed members before setting state
      const activeMembers = data ? data.filter(member => member.status?.toLowerCase() !== "removed") : [];
      setMembers(activeMembers);
      
    } catch (err) {
      console.error("Error fetching group members:", err);
      setError(err.message);
      // For demo purposes, using mock data that matches API structure
      setMembers([
        {
          groupId: "43cb1074-1dbf-4655-ad41-d99c9e6ba8d7",
          userId: "141f1925-9f60-4316-ba29-ca27ed68b9ba",
          role: "Admin",
          joinedAt: "2025-05-27T11:44:28.8611802",
          status: "Active",
          username: "4801104003",
          image: "https://socialmediastoragebinh.blob.core.windows.net/user-uploads/1748249419841-images.png",
          isFollowing: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${username} khỏi nhóm không?`)) {
      return;
    }

    setRemovingMembers(prev => new Set(prev).add(userId));

    try {
      const response = await fetch(`/api/proxy/group-members?groupId=${groupId}&userId=${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove member");
      }

      // Remove member from local state
      setMembers(prevMembers => 
        prevMembers.filter(member => member.userId !== userId)
      );

      showToast(`Đã xóa ${username} khỏi nhóm`, "success");
    } catch (error) {
      console.error("Error removing member:", error);
      showToast("Không thể xóa thành viên, vui lòng thử lại", "error");
    } finally {
      setRemovingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    try {
      const response = await fetch(`/api/proxy/follow/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      // Update local state
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.userId === userId
            ? { ...member, isFollowing: !isCurrentlyFollowing }
            : member
        )
      );

      showToast(
        isCurrentlyFollowing ? "Đã hủy theo dõi" : "Đã theo dõi",
        "success"
      );
    } catch (error) {
      console.error("Error toggling follow:", error);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  const formatJoinDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Ngày không xác định";
    }
  };

  const getRoleDisplay = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Quản trị viên";
      case "moderator":
        return "Điều hành viên";
      case "member":
        return "Thành viên";
      default:
        return "Thành viên";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Hoạt động";
      case "pending":
        return "Chờ duyệt";
      case "inactive":
        return "Không hoạt động";
      default:
        return status || "Không rõ";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if current member can be removed
  const canRemoveMember = (member) => {
    // Admin can remove members, but not themselves and not other admins
    return isAdmin && 
           member.userId !== currentUserId && 
           member.role?.toLowerCase() !== "admin";
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member =>
    member.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Thành viên nhóm
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {members.length} thành viên trong nhóm
          </p>
        </div>
        <button
          onClick={fetchGroupMembers}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Làm mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm thành viên..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Members List */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <Link href={`/user/${member.userId}`}>
                  <div className="relative cursor-pointer">
                    <Image
                      src={member.image || "/person.png"}
                      alt={member.username}
                      width={50}
                      height={50}
                      className="rounded-full border-2 border-gray-200 hover:border-blue-300 transition-colors object-cover"
                      onError={(e) => {
                        e.target.src = "/person.png";
                      }}
                    />
                  </div>
                </Link>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Link href={`/user/${member.userId}`}>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate">
                        {member.username}
                      </h3>
                    </Link>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                      {getRoleDisplay(member.role)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(member.status)}`}>
                      {getStatusDisplay(member.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Tham gia: {formatJoinDate(member.joinedAt)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                
                <Link href={`/user/${member.userId}`}>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Xem trang cá nhân
                  </button>
                </Link>

                {/* Remove Member Button - Only visible to admins for removable members */}
                {canRemoveMember(member) && (
                  <button
                    onClick={() => handleRemoveMember(member.userId, member.username)}
                    disabled={removingMembers.has(member.userId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Xóa khỏi nhóm"
                  >
                    {removingMembers.has(member.userId) ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
                    ) : (
                      <TrashIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "Không tìm thấy thành viên" : "Chưa có thành viên nào"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? "Thử thay đổi từ khóa tìm kiếm để xem kết quả khác"
              : "Nhóm này chưa có thành viên nào. Hãy mời bạn bè tham gia nhóm!"}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}