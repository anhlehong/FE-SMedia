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
 * Route handler for fetching group members
 * GET /api/group-members/{groupId}/members
 */
export async function GET(request) {
    try {
        // Get authentication token
        const token = getTokenFromServerCookies();

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get groupId from URL search params
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');

        if (!groupId) {
            return NextResponse.json(
                { error: "groupId is required" },
                { status: 400 }
            );
        }
        console.log("Fetching group members for groupId:", groupId);
        const apiUrl = `${process.env.NEXT_PUBLIC_FQDN_BACKEND}/api/group-members/${groupId}/members`;
        
        const response = await axios.get(
            apiUrl,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent, // Use the agent that ignores certificate validation
            }
        );
        
        return NextResponse.json(response.data, { status: response.status });
        
    } catch (error) {
        console.error("Error fetching group members:", error);
        
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

/**
 * Route handler for requesting to join a group
 * POST /api/group-members/request
 */
export async function POST(request) {
    try {
        // Get authentication token
        const token = getTokenFromServerCookies();

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        const requestBody = await request.json();
        
        // Validate request body
        if(!requestBody.groupId) {
            return NextResponse.json(
                { error: "groupId is required" },
                { status: 400 }
            );
        }

        const apiUrlRequest = `${process.env.NEXT_PUBLIC_FQDN_BACKEND}/api/group-members/request`;
        
        const responseRequest = await axios.post(
            apiUrlRequest,
            {groupId: requestBody.groupId}, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent, // Use the agent that ignores certificate validation
            }
        );
        
        // Return the response from the first API call
        return NextResponse.json(responseRequest.data, { status: responseRequest.status });
        
    } catch (error) {
        console.error("Error in group-members route:", error);
        
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
