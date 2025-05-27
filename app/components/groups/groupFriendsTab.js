"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { showToast } from "@/app/utils/toast";

export default function GroupMembersTab({ groupDetails }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchGroupMembers();
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
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching group members:", err);
      setError(err.message);
      // For demo purposes, using mock data
      setMembers([
        {
          id: 1,
          fullName: "Nguyễn Văn A",
          username: "nguyenvana",
          image: "/person.png",
          isFollowing: true,
          joinedAt: "2024-01-15T10:30:00Z",
          role: "member"
        },
        {
          id: 2,
          fullName: "Trần Thị B",
          username: "tranthib",
          image: "/person.png",
          isFollowing: false,
          joinedAt: "2024-01-20T14:22:00Z",
          role: "admin"
        },
        {
          id: 3,
          fullName: "Lê Minh C",
          username: "leminhc",
          image: "/person.png",
          isFollowing: true,
          joinedAt: "2024-01-25T09:15:00Z",
          role: "member"
        }
      ]);
    } finally {
      setLoading(false);
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
          member.id === userId
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
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "moderator":
        return "Điều hành viên";
      default:
        return "Thành viên";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member =>
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
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
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <Link href={`/user/${member.id}`}>
                  <div className="relative cursor-pointer">
                    <Image
                      src={member.image || "/person.png"}
                      alt={member.fullName}
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
                  <div className="flex items-center space-x-2">
                    <Link href={`/user/${member.id}`}>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate">
                        {member.fullName}
                      </h3>
                    </Link>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                      {getRoleDisplay(member.role)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">@{member.username}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tham gia: {formatJoinDate(member.joinedAt)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFollowToggle(member.id, member.isFollowing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    member.isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {member.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
                
                <Link href={`/user/${member.id}`}>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Xem trang cá nhân
                  </button>
                </Link>
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