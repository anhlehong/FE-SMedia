"use client"
import { createContext, useContext } from "react"

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children, value }) {
    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export function useWebSocketContext() {
    const context = useContext(WebSocketContext)
    if (!context) {
        throw new Error("useWebSocketContext must be used within WebSocketProvider")
    }
    return context
}
