import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import AdminHome from "./components/admin/AdminHome.jsx";
import UserHome from "./components/user/UserHome.jsx";
import UserDetails from "./components/admin/UserDetails.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/users/:userId" element={<UserDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
