import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TOKEN_NAME = 'authToken';

/**
 * GET /api/auth/token
 * Returns the authentication token from HTTP-only cookies
 * This endpoint allows client-side code to get the token value for WebSocket authentication
 * or other purposes where the token is needed but stored in HTTP-only cookies
 */

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get(TOKEN_NAME)?.value;
        
        if (!token) {
            return NextResponse.json(
                { error: 'No authentication token found' },
                { status: 401 }
            );
        }
        
        // Return the token
        return NextResponse.json({ 
            token,
            message: 'Token retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error retrieving token:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}