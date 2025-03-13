import { createContext, useContext, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("auth")) || null;
  });

  const login = async (email, password) => {
    try {
      const res = await axios.post(BASE_URL + "/auth/login", {
        email,
        password,
      });

      setUser(res.data);
      localStorage.setItem("auth", JSON.stringify(res.data));

      return res.data;
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
