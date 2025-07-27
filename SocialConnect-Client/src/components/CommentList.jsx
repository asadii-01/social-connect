import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";
import { Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function CommentList({ postId, initial = [] }) {
  const { user } = useAuth();
  const currentUserId = user._id;
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    socket.on("commentDeleted", ({ postId: pid, commentId }) => {
      if (pid === postId) {
        setComments((cs) => cs.filter((c) => c._id !== commentId));
      }
    });
    return () => socket.off("commentDeleted");
  }, [socket, postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content: text.trim(),
      });
      setComments((prevComments) => [...prevComments, data]);
      setText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments((cs) => cs.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-4">
      <div className="max-h-64 overflow-y-auto space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <img
                src={
                  comment.author?.avatarUrl ||
                  "/placeholder.jpg?height=32&width=32"
                }
                alt={comment.author?.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {comment.author?.username}
                  </span>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                  {comment.content}
                </p>
              </div>
              {/* show delete only on your own comments */}
              {comment.author._id === currentUserId && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </form>
    </section>
  );
}
