import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import socket from "../services/socket";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [user]);

  // on load, restore token
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      api
        .get("/users/me")
        .then((r) => setUser(r.data))
        .then(() => setLoading(false))
        .catch(() => logout());
    }
    else{
      setLoading(false)
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    const me = await api.get("/users/me");
    setUser(me.data);
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
