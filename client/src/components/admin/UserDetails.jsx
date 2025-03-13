import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Use axios or fetch to get data
import { BASE_URL } from "../../constants";

const UserDetails = () => {
  const { userId } = useParams(); // Get the userId from the route parameter
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [locations, setLocations] = useState([]); // For storing all locations
  const [allocatedLocations, setAllocatedLocations] = useState([]); // Locations already allocated to the user
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [selectedLocation, setSelectedLocation] = useState(null); // Selected location for allocation

  useEffect(() => {
    // Fetch user details by userId
    axios
      .get(`${BASE_URL}/users/${userId}`)
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });

    // Fetch user's allocated locations
    axios
      .get(`${BASE_URL}/users/${userId}/locations`)
      .then((response) => {
        setAllocatedLocations(response.data); // Assuming response contains allocated locations
      })
      .catch((error) => {
        console.error("Error fetching allocated locations:", error);
      });

    // Fetch all locations
    axios
      .get(`${BASE_URL}/locations`)
      .then((response) => {
        setLocations(response.data); // Assuming response contains all locations
      })
      .catch((error) => {
        console.error("Error fetching all locations:", error);
      });
  }, [userId]);

  const handleLocationClick = (locationId) => {
    navigate(`/map/${locationId}`); // Navigate to the map page for that location
  };

  const handleAllocateLocation = () => {
    // Call API to allocate the location to the user
    axios
      .post(`${BASE_URL}/location/allocate`, {
        user_id: userId,
        location_id: selectedLocation,
        time: "08:00 AM", // Example time
        reversed: false, // Example reversed status
      })
      .then((response) => {
        console.log("Location allocated:", response.data);
        setAllocatedLocations([...allocatedLocations, response.data.user]);
        setShowModal(false); // Close the modal after allocation
      })
      .catch((error) => {
        console.error("Error allocating location:", error);
      });
  };

  if (!userData) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4">
          {userData.username}'s Details
        </h1>
        <p>Email: {userData.email}</p>
        <p>Role: {userData.role}</p>

        <h3 className="mt-4">Allocated Locations:</h3>
        <ul className="space-y-3">
          {allocatedLocations.map((location) => (
            <li
              key={location._id}
              className="bg-gray-200 p-4 rounded-lg cursor-pointer flex justify-between items-center hover:bg-gray-300"
              onClick={() => handleLocationClick(location._id)}
            >
              <span className="font-semibold">{location.name}</span>
              <span
                className={`text-sm ${
                  location.status === "Active"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {location.status}
              </span>
            </li>
          ))}
        </ul>

        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)} // Open modal to allocate a location
        >
          Allocate New Location
        </button>

        {/* Modal for allocating a location */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
              <h3 className="text-xl font-semibold mb-4">Allocate Location</h3>
              <h4 className="text-lg mb-3">Choose Location:</h4>
              <ul className="space-y-3">
                {locations.map((location) => (
                  <li
                    key={location._id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={allocatedLocations.some(
                          (loc) => loc._id === location._id
                        )}
                        onChange={() => setSelectedLocation(location._id)}
                        className="mr-2"
                      />
                      <span>{location.name}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between mt-6">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setShowModal(false)} // Close modal without action
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleAllocateLocation}
                  disabled={!selectedLocation}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
