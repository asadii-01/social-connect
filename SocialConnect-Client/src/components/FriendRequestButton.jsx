import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { sendFriendRequest } from "../services/api";

export default function FriendRequestButton({ profileUser }) {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);

  const isFriend = user.friends.includes(profileUser._id);

  const handleSend = async () => {
    try {
      await sendFriendRequest(profileUser._id);
      setSent(true);
    } catch (err) {
      console.error("Friend request failed", err);
      alert("Could not send friend request");
    }
  };

  if (user.id === profileUser._id) return null;

  if (isFriend) return null;

  return (
    <button
      disabled={sent}
      onClick={handleSend}
      className={`px-4 py-2 rounded ${
        sent
          ? "bg-gray-400 text-white cursor-default"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } transition-colors`}
    >
      {sent ? "Request Sent" : "Add Friend"}
    </button>
  );
}
