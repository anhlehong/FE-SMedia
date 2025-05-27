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

export async function DELETE(request) {
    try {
        // Get authentication token
        const token = getTokenFromServerCookies();

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get groupId and userId from URL search params
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');
        const userId = searchParams.get('userId');

        if (!groupId) {
            return NextResponse.json(
                { error: "groupId is required" },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        console.log(`Removing user ${userId} from group ${groupId}`);
        
        // Construct the backend API URL
        const apiUrl = `${process.env.NEXT_PUBLIC_FQDN_BACKEND}/api/group-members/${groupId}/members/${userId}/`;
        
        const response = await axios.delete(
            apiUrl,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent, // Use the agent that ignores certificate validation
            }
        );
        
        return NextResponse.json(
            { 
                message: "Member removed successfully", 
                groupId: groupId, 
                userId: userId 
            }, 
            { status: 200 }
        );
        
    } catch (error) {
        console.error("Error removing group member:", error);
        
        if (error.response) {
            return NextResponse.json(
                { error: error.response.data.message || "An error occurred" },
                { status: error.response.status }
            );
        }
        
        // Always return a response for unexpected errors
        return NextResponse.json(
            { error: error.message || "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
