import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("auth"));

    if (storedUser) {
      autoLogin(storedUser);
    }
  }, []);

  const autoLogin = async (user) => {
    // Check user role and navigate accordingly
    if (user.role === "admin") {
      navigate("/admin/home");
    } else if (user.role === "user") {
      navigate("/user/home");
    } else {
      // Handle case if role is unknown
      logout();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password); // Assuming login returns a user object with role

      localStorage.setItem(
        "auth",
        JSON.stringify({ email, password, role: user?.role })
      ); // Save user credentials and role

      // Check user role and navigate accordingly
      if (user.role === "admin") {
        navigate("/admin/home");
      } else if (user.role === "user") {
        navigate("/user/home");
      } else {
        // Handle case if role is unknown
        logout();
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login failure (e.g., display error message)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <input
          type="email"
          className="border p-2 w-full mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
