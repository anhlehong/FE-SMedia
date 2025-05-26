"use client"

import { useState, useCallback, useRef } from "react"

export function useWebSocket() {
    const [ws, setWs] = useState(null)
    const [connected, setConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const wsRef = useRef(null)
    const isConnecting = useRef(false)
    const tokenRef = useRef(null)

    const connect = useCallback((token) => {
        console.log("🔌 [WebSocket] Connect called with token:", token?.substring(0, 20) + "...")

        if (!token) {
            console.error("❌ [WebSocket] No token provided")
            return
        }

        // Prevent duplicate connections
        if (isConnecting.current) {
            console.warn("⚠️ [WebSocket] Already connecting, skipping...")
            return
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.warn("⚠️ [WebSocket] Already connected, skipping...")
            return
        }

        // Store token for reconnection
        tokenRef.current = token
        isConnecting.current = true

        // Close existing connection
        if (wsRef.current) {
            console.log("🔄 [WebSocket] Closing existing connection")
            wsRef.current.close()
            wsRef.current = null
        }

        try {
            const wsUrl = `ws://localhost:5295/ws?token=${token}`
            console.log("🚀 [WebSocket] Creating connection to:", wsUrl)

            const socket = new WebSocket(wsUrl)
            wsRef.current = socket

            socket.onopen = () => {
                console.log("✅ [WebSocket] Connected successfully")
                setConnected(true)
                setWs(socket)
                isConnecting.current = false
            }

            socket.onerror = (error) => {
                console.error("❌ [WebSocket] Connection error:", error)
                setConnected(false)
                isConnecting.current = false
            }

            socket.onclose = (event) => {
                console.log("🔌 [WebSocket] Connection closed:", {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                })
                setConnected(false)
                setWs(null)
                wsRef.current = null
                isConnecting.current = false

                // Auto-reconnect if not intentional close
                if (event.code !== 1000 && tokenRef.current) {
                    console.log("🔄 [WebSocket] Auto-reconnecting in 3 seconds...")
                    setTimeout(() => {
                        if (tokenRef.current) {
                            connect(tokenRef.current)
                        }
                    }, 3000)
                }
            }

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log("📨 [WebSocket] Received:", data)

                    if (!data.type) {
                        console.warn("⚠️ [WebSocket] Message without type:", data)
                        return
                    }

                    setMessages((prev) => {
                        const newMessage = {
                            ...data,
                            id: `${Date.now()}-${Math.random()}`,
                            timestamp: data.timestamp || new Date().toISOString(),
                        }
                        console.log("💾 [WebSocket] Adding message:", newMessage)
                        return [...prev, newMessage]
                    })
                } catch (err) {
                    console.error("❌ [WebSocket] Parse error:", err)
                }
            }
        } catch (error) {
            console.error("❌ [WebSocket] Failed to create connection:", error)
            isConnecting.current = false
        }
    }, [])

    const sendMessage = useCallback((message) => {
        console.log("📤 [WebSocket] Sending:", message)

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error("❌ [WebSocket] Not connected, cannot send message")
            return false
        }

        try {
            wsRef.current.send(JSON.stringify(message))
            console.log("✅ [WebSocket] Message sent successfully")
            return true
        } catch (error) {
            console.error("❌ [WebSocket] Send error:", error)
            return false
        }
    }, [])

    const disconnect = useCallback(() => {
        console.log("🔌 [WebSocket] Disconnecting...")
        tokenRef.current = null
        isConnecting.current = false

        if (wsRef.current) {
            wsRef.current.close(1000, "User disconnected")
        }
    }, [])

    // Get messages for specific conversation
    const getConversationMessages = useCallback(
        (targetId, myId) => {
            if (!targetId || !myId) return []

            const filtered = messages.filter(
                (msg) =>
                    msg.type === "text" &&
                    ((msg.senderId === myId && msg.receiverId === targetId) ||
                        (msg.senderId === targetId && msg.receiverId === myId)),
            )

            console.log(`💬 [WebSocket] Conversation ${targetId} has ${filtered.length} messages`)
            return filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        },
        [messages],
    )

    // Send text message
    const sendTextMessage = useCallback(
        (receiverId, content) => {
            console.log("📝 [WebSocket] Sending text to:", receiverId, "content:", content)
            return sendMessage({
                action: "send",
                receiverId,
                content,
            })
        },
        [sendMessage],
    )

    // Get message history
    const getMessageHistory = useCallback(
        (receiverId, page = 1, pageSize = 50) => {
            console.log("📚 [WebSocket] Getting history for:", receiverId)
            return sendMessage({
                action: "gethistory",
                receiverId,
                page,
                pageSize,
            })
        },
        [sendMessage],
    )

    return {
        connected,
        messages,
        connect,
        sendMessage,
        sendTextMessage,
        getMessageHistory,
        getConversationMessages,
        disconnect,
        setMessages,
    }
}
