import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // You can use axios or fetch for API calls
import { BASE_URL } from "../../constants";

const AdminHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (!user) {
      navigate("/"); // Redirect to login if not logged in
      return;
    }

    // Fetch list of all users
    axios
      .get(BASE_URL + "/users") // API endpoint to get all users
      .then((response) => {
        setUsers(response.data); // Assuming response is an array of users
        setLoading(false); // Set loading to false once the data is fetched
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, [user, navigate]);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`); // Navigate to the user's details page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full sm:w-96">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Admin Dashboard
        </h1>
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Welcome, {user?.username}!
        </h2>

        <h3 className="text-xl font-medium text-gray-600 mb-4">Users List:</h3>

        {loading ? (
          // Shimmer effect while loading
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 p-4 rounded-lg shadow-lg animate-pulse"
              >
                <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => handleUserClick(user._id)}
                className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 text-center">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-md transform transition-transform duration-200 hover:scale-105"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
