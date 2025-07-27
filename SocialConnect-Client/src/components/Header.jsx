import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sun, Moon, LogOut, User, Bell, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-toastify";
import {
  fetchFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../services/api";
import socket from "../services/socket";
import FriendRequestList from "./FriendRequestList";

export default function Header() {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [showFR, setShowFR] = useState(false);
  const [requests, setRequests] = useState([]);
  const menuRef = useRef();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   if (!user) return;
  //   socket.on("friendRequest", (fr) =>
  //     toast.info(`${fr.from.username} sent you a request`)
  //   );
  // }, [user]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const { data } = await fetchFriendRequests();
  //       setRequests(data);
  //     } catch (err) {
  //       console.error("Could not load friend requests", err);
  //     }
  //   })();
  // }, []);

  // useEffect(() => {
  //   if (!socket) return;
  //   socket.on("friendRequest", (req) => {
  //     setRequests((rs) => [req, ...rs]);
  //   });
  //   return () => socket.off("friendRequest");
  // }, [socket]);

  // close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // real-time push of new incoming requests
  useEffect(() => {
    if (!socket) return;
    socket.on("friendRequest", (req) => {
      // you could also emit an event your FriendRequestList listens for,
      // or use a global state manager to refresh the list
      // e.g. broadcast a CustomEvent or context update
    });
    return () => socket.off("friendRequest");
  }, [socket]);

  // useEffect(() => {
  //   const onClick = (e) => {
  //     if (menuRef.current && !menuRef.current.contains(e.target)) {
  //       setShowFR(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", onClick);
  //   return () => document.removeEventListener("mousedown", onClick);
  // }, []);

  // const handleAccept = async (id) => {
  //   try {
  //     await acceptFriendRequest(id);
  //     setRequests((rs) => rs.filter((r) => r._id !== id));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  // const handleReject = async (id) => {
  //   try {
  //     await rejectFriendRequest(id);
  //     setRequests((rs) => rs.filter((r) => r._id !== id));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            SocialConnect
          </Link>

          {/* Search Bar */}
          {user && (
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-md mx-8 hidden md:flex"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users or posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                />
              </div>
            </form>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {mode === "light" ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowFR((v) => !v)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {requests.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {requests.length}
                  </span>
                )}
              </button>

              {showFR && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20">
                  <div className="flex text-gray-800 dark:text-gray-100 justify-between items-center px-4 py-2 border-b dark:border-gray-700">
                    <h4 className="font-semibold">Friend Requests</h4>
                    <button onClick={() => setShowFR(false)}>
                      <X />
                    </button>
                  </div>

                  
                  <FriendRequestList
                    requests={requests}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                </div>
              )}
            </div> */}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-20">
                  <FriendRequestList />
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Profile Link */}
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={
                      user.avatarUrl || "/placeholder.jpg?height=32&width=32"
                    }
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300">
                    {user.username}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {user && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users or posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
