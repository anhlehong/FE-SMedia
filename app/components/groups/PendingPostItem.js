"use client"
import Image from "next/image"
import { formatDistanceToNowStrict } from "date-fns"
import { useState } from "react"
import { Check, X, Loader2, FileText, Play, Download, Eye } from "lucide-react"
import { showToast } from "../../utils/toast"

export default function PendingPostItem({ post, onApprove, onDeny }) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handleApprove = async () => {
        onApprove(post.id)
    }

    const handleDeny = async () => {
        setIsProcessing(true)
        try {
            // First, hide the post by setting isVisible to false
            const hideResponse = await fetch("/api/proxy/group-posts/visible", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId: post.id,
                    isVisible: false,
                }),
            })

            if (!hideResponse.ok) {
                const errorData = await hideResponse.json()
                throw new Error(errorData.error || "Failed to hide post")
            }

            // Then deny the post using the existing onDeny callback
            onDeny(post.id)

            showToast("Bài viết đã bị ẩn và từ chối", "success")
        } catch (error) {
            console.error("Error handling post denial:", error)
            // showToast(error.message || 'Có lỗi xảy ra khi từ chối bài viết', 'error');
        } finally {
            setIsProcessing(false)
        }
    }

    if (!post.isVisible) {
        return null
    }

    // Separate media by type for better layout
    const images = post.media?.filter((item) => item.type === "image") || []
    const videos = post.media?.filter((item) => item.type === "video") || []
    const documents = post.media?.filter((item) => item.type === "document") || []

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100">
                            <Image
                                src={post.user.avatarUrl || "/avatar.png"}
                                alt={post.user.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{post.user.name}</h3>
                        <p className="text-sm text-gray-500">
                            {formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                            Chờ duyệt
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media Section */}
            {post.media && post.media.length > 0 && (
                <div className="px-6 pb-4 space-y-4">
                    {/* Images */}
                    {images.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Hình ảnh ({images.length})
                            </h4>
                            <div
                                className={`grid gap-3 ${images.length === 1
                                    ? "grid-cols-1 max-w-md"
                                    : images.length === 2
                                        ? "grid-cols-2"
                                        : "grid-cols-2 sm:grid-cols-3"
                                    }`}
                            >
                                {images.map((mediaItem, index) => (
                                    <div key={mediaItem.id || `${mediaItem.url}-${index}`} className="relative group">
                                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <Image
                                                src={mediaItem.url || "/placeholder.svg"}
                                                alt={`Hình ảnh ${index + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                unoptimized={mediaItem.url.startsWith("blob:") || mediaItem.url.startsWith("data:")}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Videos */}
                    {videos.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Video ({videos.length})
                            </h4>
                            <div
                                className={`grid gap-3 ${videos.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 sm:grid-cols-2"}`}
                            >
                                {videos.map((mediaItem, index) => (
                                    <div key={mediaItem.id || `${mediaItem.url}-${index}`} className="relative group">
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-200">
                                            <video controls src={mediaItem.url} className="w-full h-full object-cover" preload="metadata">
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    {documents.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Tài liệu ({documents.length})
                            </h4>
                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                                {documents.map((mediaItem, index) => (
                                    <a
                                        key={mediaItem.id || `${mediaItem.url}-${index}`}
                                        href={mediaItem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                                    >
                                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors duration-200">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                                                {mediaItem.url.split("/").pop() || `Tài liệu ${index + 1}`}
                                            </p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Download className="w-3 h-3" />
                                                Nhấn để tải xuống
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                            <Download className="w-4 h-4 text-gray-600" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Check className="w-4 h-4" />
                        Đồng ý
                    </button>

                    <button
                        onClick={handleDeny}
                        disabled={isProcessing}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <X className="w-4 h-4" />
                                Từ chối
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
