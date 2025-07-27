import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  auth: { token: localStorage.getItem("token") },
});

socket.on("connect", () => {
  console.log("✅ WS connected:", socket.id);
});
socket.on("connect_error", (err) => {
  console.error("❌ WS connect error:", err.message);
});
socket.on("error", (err) => {
  console.error("⚠️ WS error:", err);
});
socket.on("disconnect", () => console.log("WS disconnected"));


export default socket;
