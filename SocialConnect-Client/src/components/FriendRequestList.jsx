import { useState, useEffect } from "react";
import { Users, Check, X, Loader2 } from "lucide-react";
import api from "../services/api";
import socket from "../services/socket";

export default function FriendRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/friends/requests");
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onFR = (req) => setRequests((rs) => [req, ...rs]);
    socket.on("friendRequest", onFR);
    return () => socket.off("friendRequest", onFR);
  }, [socket]);

  const handleResponse = async (requestId, accept) => {
    if (processingIds.has(requestId)) return;

    setProcessingIds((prev) => new Set(prev).add(requestId));

    try {
      await api.post(`/friends/${requestId}/${accept ? "accept" : "reject"}`);
      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <aside className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Friend Requests
        </h3>
        {requests.length > 0 && (
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
            {requests.length}
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No pending friend requests
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const isProcessing = processingIds.has(request._id);
            return (
              <div
                key={request._id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      request.from?.avatarUrl ||
                      "/placeholder.jpg?height=40&width=40"
                    }
                    alt={request.from?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {request.from?.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      wants to be friends
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponse(request._id, true)}
                    disabled={isProcessing}
                    className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    title="Accept"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleResponse(request._id, false)}
                    disabled={isProcessing}
                    className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
