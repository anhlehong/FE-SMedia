import { getAuthToken } from "@/app/utils/auth";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function EditGroupModal({
  groupData,
  fetchGroupDetails,
  isOpen,
  onClose,
}) {
  const [formData, setFormData] = useState({
    groupName: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState(null);

  // Khởi tạo dữ liệu nhóm
  useEffect(() => {
    if (groupData) {
      setFormData({
        groupName: groupData.groupName || "",
        image: groupData.image || "",
      });
      setPreviewImage(groupData.image);
    }
  }, [groupData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Vui lòng chọn hình ảnh hợp lệ (JPEG, PNG, GIF, WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Hình ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      setError(null);
    };
    reader.onerror = () => {
      setError("Lỗi khi đọc tệp ảnh. Vui lòng thử lại.");
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Bạn cần đăng nhập để chỉnh sửa nhóm.");
      }
      console.log(groupData);

      const groupUpdateData = new FormData();
      groupUpdateData.append("groupName", formData.groupName);

      let imageUrl = formData.image;
      if (formData.image instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append("file", formData.image);

        const uploadResponse = await axios.post(
          "/api/upload-media",
          imageFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (uploadResponse.data && uploadResponse.data.mediaUrl) {
          imageUrl = uploadResponse.data.mediaUrl;
        } else {
          throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
        }
      }
      console.log(imageUrl);

      if (
        imageUrl &&
        typeof imageUrl === "string" &&
        (imageUrl !== groupData.image || formData.image instanceof File)
      ) {
        groupUpdateData.append("image", imageUrl);
      }

      const jsonData = {
        groupName: formData.groupName,
        image: imageUrl,
      };

      const response = await fetch(`/api/proxy/group/${groupData.groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      });

      if (response.status === 200 || response.status === 204) {
        setToast({
          message: "Nhóm đã được cập nhật thành công!",
          type: "success",
        });

        await fetchGroupDetails(groupData.groupId, true);

        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "flex items-center justify-center" : "hidden"
      } bg-black bg-opacity-50`}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Chỉnh sửa nhóm
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên nhóm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên nhóm:
            </label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ảnh nhóm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh nhóm:
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-lg p-2 file:bg-blue-500 file:text-white file:px-3 file:py-1 file:rounded-md file:border-none"
            />
          </div>

          {/* Hiển thị ảnh */}
          {previewImage && (
            <div className="flex justify-center">
              <Image
                src={previewImage}
                width={200}
                height={80}
                alt="User Avatar"
                className="rounded-lg object-cover border border-gray-300 w-full"
                onError={(e) => {
                  e.target.src = "/avatar.png"; // Fallback nếu ảnh lỗi
                }}
              />
            </div>
          )}

          {/* Nút submit */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg font-medium ${
                isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
