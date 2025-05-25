"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useGroupDetails } from "../../hooks/useGroupDetails";
import { showToast } from "../../utils/toast";

// Import components
import GroupHeader from "../../components/groups/groupHeader";
import GroupDiscussionTab from "../../components/groups/groupDiscussionTab";
import GroupMembersTab from "../../components/groups/groupMembersTab";
import GroupAboutTab from "../../components/groups/groupAboutTab";
import GroupPendingPostsTab from "../../components/groups/groupPendingPostsTab";
import GroupReport from "../../components/groups/groupReport";
import useMyGroups from "@/app/hooks/useMyGroups";

export default function GroupPage() {
  const params = useParams();
  const groupId = params.id;

  // State variables
  const [activeTab, setActiveTab] = useState("discussion");
  const [isMember, setIsMember] = useState(false);
  const { refreshGroups } = useMyGroups();

  // fix: Memoize onSuccess callback to prevent re-creation on every render
  const onSuccess = useCallback((data) => {
    console.log("Group details loaded successfully:", data);
  }, []);

  // fix: Memoize onError callback to prevent re-creation on every render
  const onError = useCallback((err) => {
    showToast("Failed to load group details", "error");
    console.error("Error loading group details:", err);
  }, []);

  // Use custom hook with memoized callbacks
  const {
    groupDetails,
    isLoading,
    error,
    isJoining,
    fetchGroupDetails,
    joinPublicGroup,
  } = useGroupDetails({
    groupId,
    onSuccess,
    onError,
  });

  // fix: Add cleanup flag to avoid setting state if component unmounted
  useEffect(() => {
    if (!groupId) return; // fix: guard clause to avoid invalid calls

    let isMounted = true;

    const fetchToIsMember = async () => {
      try {
        const request = await fetch(`/api/proxy/group-user/${groupId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await request.json();
        console.log("User membership status:", data);
        if (isMounted) {
          setIsMember(data);
        }
      } catch (error) {
        console.error("Error fetching group user data:", error);
      }
    };

    fetchToIsMember();

    // fix: cleanup function to set isMounted false on unmount
    return () => {
      isMounted = false;
    };
  }, [groupId]);

  // fix: Memoize handlers to avoid unnecessary re-renders or re-creations if passed down
  const handleJoinPublicGroup = useCallback(async () => {
    try {
      showToast("Đang xử lý yêu cầu tham gia...", "info");
      const result = await joinPublicGroup(groupId);

      if (result) {
        showToast("Bạn đã tham gia nhóm thành công!", "success");
        await fetchGroupDetails(groupId, true);
        refreshGroups();
      }
    } catch (error) {
      console.error("Error joining group:", error);
      showToast("Không thể tham gia nhóm, vui lòng thử lại", "error");
    }
  }, [groupId, joinPublicGroup, fetchGroupDetails]);

  const handleJoinPrivateGroup = useCallback(() => {
    showToast("Tính năng tham gia nhóm riêng tư sẽ sớm ra mắt", "info");
  }, []);

  const handlePostApproval = useCallback(
    async (postId, isApproved) => {
      try {
        showToast(
          `Đang ${isApproved ? "chấp nhận" : "từ chối"} bài viết...`,
          "info"
        );

        const response = await fetch("/api/proxy/group-posts/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            postId,
            approve: isApproved,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to ${isApproved ? "approve" : "reject"} post`
          );
        }

        showToast(
          `Bài viết đã được ${isApproved ? "chấp nhận" : "từ chối"}`,
          "success"
        );
      } catch (error) {
        console.error(
          `Error ${isApproved ? "approving" : "denying"} post:`,
          error
        );
        showToast(
          `Không thể ${
            isApproved ? "chấp nhận" : "từ chối"
          } bài viết, vui lòng thử lại`,
          "error"
        );
      }
    },
    [groupId]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !groupDetails) {
    return (
      <div className="bg-white rounded-lg shadow p-8 mt-4 text-center">
        <div className="text-red-500 mb-4">
          <p className="mb-2">Error loading group details</p>
          <p>{error || "Group not found"}</p>
        </div>
        <button
          onClick={() => fetchGroupDetails(groupId, true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <GroupHeader
        groupDetails={groupDetails}
        isMember={isMember}
        isJoining={isJoining}
        handleJoinPublicGroup={handleJoinPublicGroup}
        handleJoinPrivateGroup={handleJoinPrivateGroup}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <>
        {activeTab === "discussion" && (
          <GroupDiscussionTab isMember={isMember} groupId={groupId} />
        )}
        {activeTab === "members" && (
          <GroupMembersTab groupDetails={groupDetails} />
        )}
        {activeTab === "about" && <GroupAboutTab groupDetails={groupDetails} />}
        {activeTab === "pendingPosts" && (
          <GroupPendingPostsTab
            groupId={groupId}
            handlePostApproval={handlePostApproval}
          />
        )}
        {activeTab === "report" && <GroupReport group={groupDetails} />}
      </>
    </>
  );
}
