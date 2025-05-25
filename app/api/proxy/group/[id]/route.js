import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import https from "https";

const TOKEN_NAME = "authToken";

// Helper function to get token from cookies in server components
function getTokenFromServerCookies() {
  const cookieStore = cookies();
  return cookieStore.get(TOKEN_NAME)?.value || null;
}

// Create HTTPS agent to ignore SSL certificate validation
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Ignore SSL certificate validation
});

/**
 * Route handler for getting a group by ID
 * GET /api/proxy/group/{groupId}
 */
export async function GET(request, { params }) {
  try {
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Get authentication token
    const token = getTokenFromServerCookies();
    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to view group details" },
        { status: 401 }
      );
    }

    console.log(`Fetching group details for ID: ${groupId}`);

    // Make the request to the backend API
    const apiUrl = `${process.env.NEXT_PUBLIC_FQDN_BACKEND}/api/groups/${groupId}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      httpsAgent, // Use the agent that ignores certificate validation
    });

    console.log("Group details response:", response.data);

    // Return the group data
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error retrieving group details:", error);

    // Format error response with more detailed information
    const status = error.response?.status || 500;
    let message = "An error occurred while retrieving the group details";

    if (error.response?.data) {
      message =
        error.response.data.message || error.response.data.error || message;
    }

    // Handle specific error codes
    if (status === 404) {
      message = "Group not found";
    } else if (status === 401) {
      message = "You need to be logged in to view group details";
    } else if (status === 403) {
      message = "You don't have permission to access this group";
    } else if (status === 429) {
      message = "Too many requests, please try again later";
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const groupId = params.id;
    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Lấy authentication token
    const token = getTokenFromServerCookies();
    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to edit group details" },
        { status: 401 }
      );
    }

    // Lấy dữ liệu từ request body
    const { groupName, image } = await request.json();
    if (!groupName || !image) {
      return NextResponse.json(
        { error: "Both groupName and image are required" },
        { status: 400 }
      );
    }

    console.log(`Updating group details for ID: ${groupId}`);

    // Gửi request đến API backend
    const apiUrl = `${process.env.NEXT_PUBLIC_FQDN_BACKEND}/api/groups/${groupId}`;

    const response = await axios.put(
      apiUrl,
      { groupName, image },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        httpsAgent, // Sử dụng agent để bỏ qua xác thực chứng chỉ nếu cần
      }
    );

    console.log("Group updated response:", response.data);

    // Trả về dữ liệu nhóm sau khi cập nhật
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error updating group details:", error);

    // Xử lý lỗi chi tiết hơn
    const status = error.response?.status || 500;
    let message = "An error occurred while updating the group details";

    if (error.response?.data) {
      message =
        error.response.data.message || error.response.data.error || message;
    }

    // Xử lý từng loại lỗi HTTP
    if (status === 404) {
      message = "Group not found";
    } else if (status === 401) {
      message = "You need to be logged in to edit group details";
    } else if (status === 403) {
      message = "You don't have permission to modify this group";
    } else if (status === 429) {
      message = "Too many requests, please try again later";
    }

    return NextResponse.json({ error: message }, { status });
  }
}
