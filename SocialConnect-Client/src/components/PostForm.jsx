"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Send, X } from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../contexts/AuthContext";

export default function PostForm({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && !imageUrl.trim()) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (file && !imageUrl) {
        await handleUpload();
      }
      const { data: post } = await api.post("/posts", {
        content: content.trim(),
        imageUrl: imageUrl.trim(),
      });
      onPosted(post);

      setContent("");
      setImageUrl("");
      setFile(null);
      setPreview("");
      setShowImageInput(false);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Could not create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setFileUploading(true);
      const res = await api.post("/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Could not upload image");
    } finally {
      setFileUploading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  const removeImage = () => {
    setImageUrl("");
    setShowImageInput(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info and Text Area */}
        <div className="flex gap-4">
          <img
            src={user?.avatarUrl || "/placeholder.jpg?height=48&width=48"}
            alt={user?.username}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
          />
          <div className="flex-1">
            <textarea
              className="w-full resize-none border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg leading-relaxed"
              rows="3"
              placeholder={`What's on your mind, ${user?.username}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Image Preview */}
        {/* {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Preview"
              className="w-full max-h-64 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )} */}

        {/* Image URL Input */}
        {/* {showImageInput && (
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              placeholder="Enter image URL..."
              value={imageUrl}
              onChange={handleImageUrlChange}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowImageInput(false)}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )} */}

        {showImageInput && (
          <div className="relative flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-gray-500 dark:text-gray-400">
              {file ? file.name : "Click or drag image to upload"}
            </p>
          </div>
        )}
        {preview && (
          <div className="flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-full max-w-xs rounded-lg object-cover border border-gray-200 dark:border-gray-600"
            />
          </div>
        )}

        {file && !imageUrl && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={fileUploading}
              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {fileUploading ? "Uploading…" : "Upload Image"}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {!showImageInput && (
              <button
                type="button"
                onClick={() => setShowImageInput(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Photo</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !imageUrl.trim()) || isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
