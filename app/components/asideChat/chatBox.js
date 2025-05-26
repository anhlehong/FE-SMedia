"use client";
import { useEffect, useState, useRef } from "react";
import { useWebSocketContext } from "../../contexts/websocket-context";

export default function ChatBox({ onClose, name, targetId }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const historyLoadedRef = useRef(false);

  console.log(`💬 [ChatBox] Opened for: ${name} (${targetId})`);

  // Get WebSocket context
  const {
    connected,
    sendTextMessage,
    getMessageHistory,
    getConversationMessages,
    userInfo,
  } = useWebSocketContext();

  // Get messages for this conversation
  const conversationMessages = getConversationMessages(
    targetId,
    userInfo?.userId
  );

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  // Load message history when chat opens and WebSocket is connected
  useEffect(() => {
    if (
      connected &&
      targetId &&
      userInfo?.userId &&
      !historyLoadedRef.current
    ) {
      console.log(`📚 [ChatBox] Loading history for ${targetId}`);

      // Set flag immediately to prevent duplicate calls
      historyLoadedRef.current = true;

      // Add small delay to ensure WebSocket is fully ready
      const timeoutId = setTimeout(() => {
        getMessageHistory(targetId, 1, 50);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [connected, targetId, userInfo?.userId, getMessageHistory]);

  // Reset history loaded when targetId changes
  useEffect(() => {
    console.log(
      `🔄 [ChatBox] Target changed to: ${targetId}, resetting history flag`
    );
    historyLoadedRef.current = false;
  }, [targetId]);

  // Debug effect to track when history is loaded
  useEffect(() => {
    console.log(
      `🔍 [ChatBox] History loaded state: ${historyLoadedRef.current} for ${targetId}`
    );
  }, [historyLoadedRef.current, targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || !connected || isLoading || !targetId) {
      console.log("⚠️ [ChatBox] Cannot send - conditions not met");
      return;
    }

    console.log(
      `📤 [ChatBox] Sending message to ${targetId}: ${message.trim()}`
    );
    setIsLoading(true);

    try {
      const success = sendTextMessage(targetId, message.trim());

      if (success) {
        console.log("✅ [ChatBox] Message sent successfully");
        setMessage("");
      } else {
        console.error("❌ [ChatBox] Failed to send message");
        alert("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.");
      }
    } catch (error) {
      console.error("❌ [ChatBox] Send error:", error);
      alert("Có lỗi xảy ra khi gửi tin nhắn.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed bottom-0 -mr-40 lg:bottom-16 lg:right-72 w-full md:w-80 h-96 bg-white rounded-t-lg shadow-lg flex flex-col z-50 border border-gray-200">
      {/* Chat Header */}
      <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
            title={connected ? "Đã kết nối" : "Mất kết nối"}
          />
          <span className="text-xs text-gray-500">
            ({conversationMessages.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-lg font-bold"
        >
          ✕
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {!connected ? (
          <div className="text-center text-red-500 py-4">
            <p>⚠️ Mất kết nối WebSocket</p>
            <p className="text-sm">Vui lòng đợi kết nối lại...</p>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>💬 Chưa có tin nhắn nào</p>
            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          conversationMessages.map((msg) => {
            const isMine = msg.senderId === userInfo?.userId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    isMine
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border rounded-bl-sm"
                  }`}
                >
                  <div className="break-words">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isMine ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="border-t p-3 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
            disabled={!connected || isLoading}
          />
          <button
            type="submit"
            disabled={!connected || !message.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Gửi"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
