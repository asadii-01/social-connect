import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api" });
export default api;

export const sendFriendRequest = (userId) =>
  api.post(`/friends/request`, { to: userId });

export const fetchFriendRequests = () => api.get("/friends/requests");

export const acceptFriendRequest = (requestId) =>
  api.post(`/friends/${requestId}/accept`);

export const rejectFriendRequest = (requestId) =>
  api.post(`/friends/${requestId}/reject`);

export const fetchFriends = (userId) =>
  api.get(`/friends/${userId}`);
