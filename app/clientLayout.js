"use client"
import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import localFont from "next/font/local"
import NavBar from "./public/navbar"
import MessageBar from "./public/messageBar"
import LeftSidebar from "./components/sidebar/leftSidebar"
import { useWebSocket } from "./hooks/use-websocket"
import { getTokenFromServer, isAuthenticated, getUserInfo } from "./utils/auth"
import { WebSocketProvider } from "./contexts/websocket-context"
import "./globals.css"

// Font configuration
const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
})
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
})

export default function ClientLayout({ children }) {
    const pathname = usePathname()
    const isAuthPage = pathname === "/signin" || pathname === "/signup"

    // WebSocket hook - chỉ tạo 1 lần
    const webSocketHook = useWebSocket()
    const { connected, connect, disconnect, setMessages } = webSocketHook

    const [token, setToken] = useState(null)
    const [userInfo, setUserInfo] = useState(null)
    const initRef = useRef(false) // Prevent double initialization

    console.log(
        "🏗️ [ClientLayout] Render - isAuthPage:",
        isAuthPage,
        "connected:",
        connected,
        "initialized:",
        initRef.current,
    )

    // Initialize connection - chỉ chạy 1 lần duy nhất
    useEffect(() => {
        // Skip if auth page or already initialized
        if (isAuthPage || initRef.current) {
            return
        }

        console.log("🚀 [ClientLayout] Starting initialization...")
        initRef.current = true

        const initializeApp = async () => {
            try {
                // 1. Get authentication status
                const isLoggedIn = isAuthenticated?.() ?? false
                console.log("🔐 [ClientLayout] Auth status:", isLoggedIn)

                // 2. Get token
                let fetchedToken = null
                if (isLoggedIn) {
                    fetchedToken = localStorage.getItem("token")
                    if (!fetchedToken) {
                        fetchedToken = await getTokenFromServer()
                    }
                } else {
                    fetchedToken = await getTokenFromServer()
                }

                console.log("🔑 [ClientLayout] Token obtained:", !!fetchedToken)
                setToken(fetchedToken)

                // 3. Get user info
                if (fetchedToken) {
                    try {
                        const info = await getUserInfo()
                        setUserInfo(info)
                        console.log("👤 [ClientLayout] User info:", info)
                    } catch (error) {
                        console.error("❌ [ClientLayout] Failed to get user info:", error)
                    }

                    // 4. Connect WebSocket
                    console.log("🔌 [ClientLayout] Connecting WebSocket...")
                    connect(fetchedToken)
                }
            } catch (error) {
                console.error("❌ [ClientLayout] Initialization error:", error)
            }
        }

        initializeApp()

        // Cleanup on unmount
        return () => {
            console.log("🧹 [ClientLayout] Cleanup")
            disconnect()
        }
    }, [isAuthPage]) // Only depend on isAuthPage

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <WebSocketProvider value={{ ...webSocketHook, userInfo }}>
                    <div className="bg-gray-100 min-h-screen">
                        {/* Fixed Navbar */}
                        {!isAuthPage && (
                            <div className="fixed w-full z-50">
                                <NavBar />
                            </div>
                        )}

                        {/* Main Layout */}
                        <div className={`flex flex-col md:flex-row ${!isAuthPage ? "pt-16" : ""}`}>
                            {/* Left Sidebar */}
                            {!isAuthPage && <LeftSidebar />}

                            {/* Main Content */}
                            <div className={`flex-1 flex justify-center ${isAuthPage ? "w-full" : ""}`}>
                                <main className={isAuthPage ? "w-full" : "w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl"}>
                                    {children}
                                </main>
                            </div>

                            {/* Right Sidebar (MessageBar) */}
                            {!isAuthPage && <MessageBar />}
                        </div>
                    </div>
                </WebSocketProvider>
            </body>
        </html>
    )
}
