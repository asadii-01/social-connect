"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Trash2,
  Edit2,
} from "lucide-react";
import CommentList from "./CommentList";
import { X } from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";

export default function PostCard({ post }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl);

  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(
    post.likers?.includes(post.currentUserId) || false
  );
  const [comments, setComments] = useState([]);
  const [likeCount, setLikeCount] = useState(post.likers?.length || 0);
  const [isLiking, setIsLiking] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${post._id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error(`Failed to fetch comments for post ${post._id}:`, error);
    }
  };

  const { user } = useAuth();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    fetchComments();
    socket.on("newComment", ({ postId }) =>
      postId === post._id ? fetchComments() : null
    );
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = () => {
    setShowOptions(false);
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: updated } = await api.put(`/posts/${post._id}`, {
        content: editContent,
        imageUrl: editImageUrl,
      });
      setIsEditing(false);
      navigate(0);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      //socket.emit("deletePost", { postId: post._id });
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleToggleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = liked;

    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      await api.post(`/posts/${post._id}/like`);
      //socket.emit("toggleLike", { postId: post._id });
    } catch (error) {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleComments = () => setShowComments((v) => !v);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={
                post.author?.avatarUrl || "/placeholder.jpg?height=40&width=40"
              }
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {post.author?.username}
              </h4>
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.createdAt)}
              </time>
            </div>
          </div>

          {user._id === post.author._id && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowOptions((v) => !v)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Post options"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 flex items-center text-white gap-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* inline edit modal */}
        {isEditing && (
          <div
            className="fixed inset-0 z-50 flex text-white items-center justify-center bg-black/50 p-4"
            onClick={() => setIsEditing(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3"
                onClick={() => setIsEditing(false)}
              >
                <X />
              </button>
              <h3 className="mb-4 text-lg font-semibold">Edit Post</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Image URL (optional)"
                  className="w-full p-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        { !isEditing && (
          <div className="px-4 pb-3">
            {post.content && (
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                {post.content}
              </p>
            )}
          </div>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div className="relative">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt="Post content"
              className="w-full max-h-96 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <button
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                liked
                  ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  liked ? "fill-current" : ""
                } ${isLiking ? "scale-110" : ""}`}
              />
              <span className="font-medium">{likeCount}</span>
            </button>

            {/* <Link
            to={`/posts/${post._id}`}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.commentCount || 0}</span>
          </Link> */}
            <button
              onClick={toggleComments}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{comments.length}</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>
      </article>
      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={toggleComments} // click backdrop to close
        >
          <div
            className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* Close button */}
            <button
              onClick={toggleComments}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close comments"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Title */}
            <div className="px-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Comments ({comments.length})
              </h3>
            </div>

            {/* Actual comment list */}
            <div className="px-6 pb-6">
              <CommentList postId={post._id} initial={comments} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
