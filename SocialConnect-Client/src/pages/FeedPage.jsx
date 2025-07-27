import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await api.get("/posts/feed");
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    socket.on("newPost", (newPost) => {
      setPosts((prev) => {
        if (prev.some((p) => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
    });
    socket.on("newLike", ({ postId, likerId }) => {
      setPosts((ps) =>
        ps.map((x) =>
          x._id === postId ? { ...x, likers: [...x.likers, likerId] } : x
        )
      );
    });
    socket.on("postDeleted", ({ postId }) =>
      setPosts((ps) => ps.filter((x) => x._id !== postId))
    );

    return () => {
      socket.off("newPost");
      socket.off("newLike");
      socket.off("postDeleted");
    };
  }, []);

  const handleNewPost = (newPost) => {
    //setPosts((prevPosts) => [newPost, ...prevPosts])
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchPosts();
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 px-4 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading your feed...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto py-6 px-4 max-w-2xl">
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4 max-w-2xl">
      <PostForm onPosted={handleNewPost} />

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to share something with your friends!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
