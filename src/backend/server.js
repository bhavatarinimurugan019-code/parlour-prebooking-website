const express = require("express");
const path = require("path");
require("dotenv").config();
const { getData, initializeDatabase, saveData } = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const ROOT = path.join(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   FRONTEND
========================= */

app.use(express.static(FRONTEND));

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(FRONTEND, "admin.html"));
});

/* =========================
   STATUS
========================= */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "KIRUTHIS PARLOUR server is running"
  });
});

/* =========================
   ADMIN LOGIN
========================= */

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({
      success: true,
      message: "Login successful"
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });
});

/* =========================
   SERVICES
========================= */

app.get("/api/services", async (req, res, next) => {
  try {
    const data = await getData();

    res.json({
      success: true,
      services: data.services || []
    });
  } catch (error) {
    next(error);
  }
});

/* ADD SERVICE */

app.post("/api/services", async (req, res, next) => {
  try {
  const data = await getData();

  const {
    name,
    category,
    price,
    duration,
    image
  } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "Name, category and price are required"
    });
  }

  const newService = {
    id: Date.now(),
    name: String(name).trim(),
    category: String(category).trim(),
    price: Number(price),
    duration: duration || "30 min",
    image: image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
  };

  data.services.push(newService);
  await saveData(data);

  res.json({
    success: true,
    service: newService,
    message: "Service added successfully"
  });
  } catch (error) {
    next(error);
  }
});

/* EDIT SERVICE */

app.put("/api/services/:id", async (req, res, next) => {
  try {
  const data = await getData();

  const id = Number(req.params.id);

  const index = data.services.findIndex(
    service => Number(service.id) === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  const oldService = data.services[index];

  const updatedService = {
    id: oldService.id,
    name: req.body.name ?? oldService.name,
    category: req.body.category ?? oldService.category,
    price:
      req.body.price !== undefined
        ? Number(req.body.price)
        : oldService.price,
    duration: req.body.duration ?? oldService.duration,
    image: req.body.image ?? oldService.image
  };

  data.services[index] = updatedService;

  await saveData(data);

  res.json({
    success: true,
    service: updatedService,
    message: "Service updated successfully"
  });
  } catch (error) {
    next(error);
  }
});

/* DELETE SERVICE */

app.delete("/api/services/:id", async (req, res, next) => {
  try {
  const data = await getData();

  const id = Number(req.params.id);

  const oldLength = data.services.length;

  data.services = data.services.filter(
    service => Number(service.id) !== id
  );

  if (data.services.length === oldLength) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  await saveData(data);

  res.json({
    success: true,
    message: "Service deleted successfully"
  });
  } catch (error) {
    next(error);
  }
});

/* =========================
   BOOKINGS
========================= */

app.get("/api/bookings", async (req, res, next) => {
  try {
  const data = await getData();

  res.json({
    success: true,
    bookings: data.bookings || []
  });
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", async (req, res, next) => {
  try {
  const data = await getData();

  const {
    customerName,
    phone,
    email,
    service,
    price,
    members,
    date,
    time,
    notes
  } = req.body;

  if (!customerName || !phone || !service || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required fields"
    });
  }

  const booking = {
    id: Date.now(),
    customerName,
    phone,
    email: email || "",
    service,
    price: Number(price || 0),
    members: Number(members || 1),
    date,
    time,
    notes: notes || "",
    status: "Pending",
    paymentStatus: "Pending",
    createdAt: new Date().toISOString()
  };

  data.bookings.push(booking);
  await saveData(data);

  res.json({
    success: true,
    booking,
    message: "Booking created successfully"
  });
  } catch (error) {
    next(error);
  }
});

app.get("/api/bookings/:id", async (req, res, next) => {
  try {
  const data = await getData();

  const id = Number(req.params.id);

  const booking = data.bookings.find(
    item => Number(item.id) === id
  );

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  res.json({
    success: true,
    booking
  });
  } catch (error) {
    next(error);
  }
});

app.put("/api/bookings/:id", async (req, res, next) => {
  try {
  const data = await getData();

  const id = Number(req.params.id);

  const index = data.bookings.findIndex(
    item => Number(item.id) === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  data.bookings[index] = {
    ...data.bookings[index],
    ...req.body,
    id: data.bookings[index].id
  };

  await saveData(data);

  res.json({
    success: true,
    booking: data.bookings[index],
    message: "Booking updated successfully"
  });
  } catch (error) {
    next(error);
  }
});

/* IMPORTANT:
   CLEAR ROUTE MUST COME BEFORE /:id
*/

app.delete("/api/bookings/clear", async (req, res, next) => {
  try {
  const data = await getData();

  const count = data.bookings.length;

  data.bookings = [];

  await saveData(data);

  res.json({
    success: true,
    deletedCount: count,
    message: "All bookings cleared successfully"
  });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/bookings/:id", async (req, res, next) => {
  try {
  const data = await getData();

  const id = Number(req.params.id);

  const index = data.bookings.findIndex(
    item => Number(item.id) === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  data.bookings[index].status = "Cancelled";

  await saveData(data);

  res.json({
    success: true,
    message: "Booking cancelled successfully"
  });
  } catch (error) {
    next(error);
  }
});

/* =========================
   GALLERY
========================= */

app.get("/api/gallery", async (req, res, next) => {
  try {
  const data = await getData();

  res.json({
    success: true,
    gallery: data.gallery || []
  });
  } catch (error) {
    next(error);
  }
});

app.post("/api/gallery", async (req, res, next) => {
  try {
  const data = await getData();

  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      message: "Image URL is required"
    });
  }

  data.gallery.push(imageUrl);

  await saveData(data);

  res.json({
    success: true,
    message: "Image added successfully",
    gallery: data.gallery
  });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/gallery/:index", async (req, res, next) => {
  try {
  const data = await getData();

  const index = Number(req.params.index);

  if (
    Number.isNaN(index) ||
    index < 0 ||
    index >= data.gallery.length
  ) {
    return res.status(404).json({
      success: false,
      message: "Image not found"
    });
  }

  data.gallery.splice(index, 1);

  await saveData(data);

  res.json({
    success: true,
    message: "Image deleted successfully",
    gallery: data.gallery
  });
  } catch (error) {
    next(error);
  }
});

/* =========================
   DASHBOARD
========================= */

app.get("/api/dashboard", async (req, res, next) => {
  try {
  const data = await getData();

  const bookings = data.bookings || [];
  const services = data.services || [];

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    b => b.status === "Pending"
  ).length;

  const confirmedBookings = bookings.filter(
    b => b.status === "Confirmed"
  ).length;

  const paidBookings = bookings.filter(
    b => b.paymentStatus === "Paid"
  ).length;

  const revenue = bookings
    .filter(b => b.paymentStatus === "Paid")
    .reduce(
      (total, b) => total + Number(b.price || 0),
      0
    );

  res.json({
    success: true,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    paidBookings,
    revenue,
    totalServices: services.length,
    totalGallery: (data.gallery || []).length
  });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error("API error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

/* =========================
   START SERVER
========================= */

if (require.main === module) {
  initializeDatabase()
    .catch(error => {
      console.error("MongoDB initialization failed:", error.message);
    })
    .finally(() => app.listen(PORT, () => {
    console.log("");
    console.log("====================================");
    console.log(" KIRUTHIS PARLOUR");
    console.log(" Server running successfully");
    console.log(` Customer: http://localhost:${PORT}`);
    console.log(` Admin:    http://localhost:${PORT}/admin`);
    console.log("====================================");
    console.log("");
    }));
}

module.exports = app;