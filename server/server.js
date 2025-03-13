const express = require("express");
const cors = require("cors");
const fs = require("fs");
const moment = require("moment");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const USERS_FILE = "user.json";
const LOCATIONS_FILE = "location.json";

// Helper functions
const readData = (file) => JSON.parse(fs.readFileSync(file));
const writeData = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

/* ---------- AUTHENTICATION ROUTES ---------- */
// Login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const users = readData(USERS_FILE);
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    id: user._id,
    email: user.email,
    name: user.username,
    role: user.role,
  });
});

// Register
app.post("/auth/register", (req, res) => {
  const { username, email, password, role = "user" } = req.body;
  const users = readData(USERS_FILE);

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const newUser = {
    _id: users.length + 1,
    email,
    username,
    password,
    role,
    allocated_places: [],
    status: "offline",
    live_location: null,
    history: [],
  };

  users.push(newUser);
  writeData(USERS_FILE, users);
  res.json({ message: "User registered successfully" });
});

/* ---------- USER ROUTES ---------- */
// Get all users with role "user"
app.get("/users", (req, res) => {
  const users = readData(USERS_FILE);
  res.json(users.filter((u) => u.role === "user"));
});

// Get user details
app.get("/users/:user_id", (req, res) => {
  const users = readData(USERS_FILE);
  const user = users.find((u) => u._id == req.params.user_id);
  user ? res.json(user) : res.status(404).json({ message: "User not found" });
});

// Get allocated locations of a user
app.get("/users/:user_id/locations", (req, res) => {
  const users = readData(USERS_FILE);
  const locations = readData(LOCATIONS_FILE);
  const user = users.find((u) => u._id == req.params.user_id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const allocated = user.allocated_places.map((place) => ({
    _id: place.id,
    name: locations.find((loc) => loc._id == place.id)?.name || "Unknown",
    status: place.status,
  }));

  res.json(allocated);
});

// Get a specific allocated location of a user
app.get("/users/:user_id/location/:location_id", (req, res) => {
  const locations = readData(LOCATIONS_FILE);
  const location = locations.find((loc) => loc._id == req.params.location_id);

  location
    ? res.json(location)
    : res.status(404).json({ message: "Location not found" });
});

/* ---------- LOCATION ROUTES ---------- */

// Get all locations
app.get("/locations", (req, res) => {
  const locations = readData(LOCATIONS_FILE);
  res.json(locations);
});

// Create a location
app.post("/location/create", (req, res) => {
  const locations = readData(LOCATIONS_FILE);
  const { name, source, destination, points } = req.body;

  const newLocation = {
    _id: locations.length + 1,
    name,
    source,
    destination,
    points,
  };

  locations.push(newLocation);
  writeData(LOCATIONS_FILE, locations);
  res.json({ message: "Location created successfully", location: newLocation });
});

// Start a location tracking
app.post("/location/start", (req, res) => {
  const { user_id, location_id, timestamp } = req.body;
  const users = readData(USERS_FILE);

  const user = users.find((u) => u._id == user_id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const allocated = user.allocated_places.find(
    (place) => place.id == location_id
  );
  if (!allocated || allocated.status === "live") {
    return res
      .status(400)
      .json({ message: "Location is already live or not allocated" });
  }

  // Update status
  allocated.status = "live";
  allocated.start_time = timestamp;
  user.status = "live";

  writeData(USERS_FILE, users);
  res.json({ message: "Location tracking started" });
});

// Stop a location tracking
app.post("/location/stop", (req, res) => {
  const { user_id, location_id, timestamp } = req.body;
  const users = readData(USERS_FILE);

  const user = users.find((u) => u._id == user_id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const allocated = user.allocated_places.find(
    (place) => place.id == location_id
  );
  if (!allocated || allocated.status === "offline") {
    return res
      .status(400)
      .json({ message: "Location is already offline or not allocated" });
  }

  // Calculate duration
  const duration = moment
    .utc(
      moment(timestamp, "HH:mm:ss").diff(
        moment(allocated.start_time, "HH:mm:ss")
      )
    )
    .format("HH:mm:ss");

  user.history.push({
    id: user.history.length + 1,
    location_id,
    start_time: allocated.start_time,
    end_time: timestamp,
    total_duration: duration,
  });

  allocated.status = "offline";
  allocated.start_time = null;
  user.status = "offline";

  writeData(USERS_FILE, users);
  res.json({ message: "Location tracking stopped" });
});

// Update live location
app.put("/location/live-location", (req, res) => {
  const { user_id, currentLocation } = req.body;
  const users = readData(USERS_FILE);

  const user = users.find((u) => u._id == user_id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.live_location = currentLocation;
  writeData(USERS_FILE, users);
  res.json({ message: "Live location updated" });
});

// Get user's live location
app.get("/location/live-location/:user_id", (req, res) => {
  const users = readData(USERS_FILE);
  const user = users.find((u) => u._id == req.params.user_id);

  user
    ? res.json({ live_location: user.live_location })
    : res.status(404).json({ message: "User not found" });
});

// Allocate location to user
app.post("/location/allocate", (req, res) => {
  const { user_id, location_id, time, reversed } = req.body;
  const users = readData(USERS_FILE);

  const user = users.find((u) => u._id == user_id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.allocated_places.push({
    id: location_id,
    date: "",
    time,
    status: "offline",
    reversed,
  });

  writeData(USERS_FILE, users);
  res.json({ message: "Location allocated successfully" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
