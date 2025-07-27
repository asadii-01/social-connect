"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Calendar, Heart, Users, Edit3, Loader2 } from "lucide-react";
import api, { fetchFriends } from "../services/api";
import PostCard from "../components/PostCard";
import ProfileForm from "../components/ProfileForm";
import FriendRequestButton from "../components/FriendRequestButton";

export default function ProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setError(null);
        const response = await api.get(`/users/${username}`);
        const isMe = response.data.user.isMe;
        setUserData({ ...response.data.user._doc, isMe });
        setPosts(response.data.posts || []);

        const { data: friends } = await fetchFriends(response.data.user._doc._id);
        setFriendCount(friends.length);

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !userData) {
    return (
      <main className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">
              {error || "Profile not found"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <main className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover Photo Placeholder */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <img
                  src={
                    userData.avatarUrl ||
                    "/placeholder.jpg?height=128&width=128"
                  }
                  alt={userData.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />
                <div className="pb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {userData.name || userData.username}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    @{userData.username}
                  </p>
                </div>
              </div>

              {userData.isMe && (
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}

              {!userData.isMe && <FriendRequestButton profileUser={userData} />}
            </div>

            {/* Bio */}
            {userData.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {userData.bio}
              </p>
            )}

            {/* Profile Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {userData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{userData.location}</span>
                </div>
              )}

              {userData.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(userData.createdAt)}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{posts.length} posts</span>
              </div>

              <div className="flex items-center gap-1">
                {friendCount} {friendCount === 1 ? "friend" : "friends"}
              </div>
            </div>

            {/* Interests */}
            {userData.interests && userData.interests.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Interests
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        {userData.isMe && showEditForm && <ProfileForm />}

        {/* Posts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Posts
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {userData.isMe
                    ? "You haven't shared anything yet."
                    : `${userData.username} hasn't shared anything yet.`}
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
        </div>
      </div>
    </main>
  );
}
