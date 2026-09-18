const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "..", "backend", "data.json");

function getData() {
  try {
    if (!fs.existsSync(dataFile)) {
      return {
        services: [],
        bookings: [],
        gallery: []
      };
    }

    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (error) {
    console.error("Error reading data.json:", error);
    return {
      services: [],
      bookings: [],
      gallery: []
    };
  }
}

function saveData(data) {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

/*
  GET ALL BOOKINGS
  /api/bookings
*/
router.get("/", (req, res) => {
  const data = getData();

  res.json({
    success: true,
    bookings: data.bookings || []
  });
});

/*
  GET SINGLE BOOKING
  /api/bookings/:id
*/
router.get("/:id", (req, res) => {
  const data = getData();

  const booking = (data.bookings || []).find(
    b => String(b.id) === String(req.params.id)
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
});

/*
  CREATE BOOKING
  POST /api/bookings
*/
router.post("/", (req, res) => {
  const data = getData();

  const {
    customerName,
    phone,
    email,
    service,
    price,
    date,
    time,
    notes,
    members
  } = req.body;

  if (!customerName || !phone || !service || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required booking details"
    });
  }

  const newBooking = {
    id: Date.now(),
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : "",
    service: service.trim(),
    price: Number(price) || 0,
    members: Number(members) || 1,
    date,
    time,
    notes: notes ? notes.trim() : "",
    status: "Pending",
    paymentStatus: "Pending",
    createdAt: new Date().toISOString()
  };

  if (!data.bookings) {
    data.bookings = [];
  }

  data.bookings.push(newBooking);

  saveData(data);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    booking: newBooking
  });
});

/*
  UPDATE BOOKING
  PUT /api/bookings/:id
*/
router.put("/:id", (req, res) => {
  const data = getData();

  const index = (data.bookings || []).findIndex(
    b => String(b.id) === String(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  const oldBooking = data.bookings[index];

  data.bookings[index] = {
    ...oldBooking,
    ...req.body,
    id: oldBooking.id
  };

  saveData(data);

  res.json({
    success: true,
    message: "Booking updated successfully",
    booking: data.bookings[index]
  });
});

/*
  CLEAR ALL BOOKINGS
  IMPORTANT:
  Keep this BEFORE /:id
  DELETE /api/bookings/clear
*/
router.delete("/clear", (req, res) => {
  const data = getData();

  const count = (data.bookings || []).length;

  data.bookings = [];

  saveData(data);

  res.json({
    success: true,
    deletedCount: count,
    message: "All bookings cleared successfully"
  });
});

/*
  DELETE / CANCEL SINGLE BOOKING
  DELETE /api/bookings/:id
*/
router.delete("/:id", (req, res) => {
  const data = getData();

  const index = (data.bookings || []).findIndex(
    b => String(b.id) === String(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  data.bookings[index].status = "Cancelled";

  saveData(data);

  res.json({
    success: true,
    message: "Booking cancelled successfully",
    booking: data.bookings[index]
  });
});

module.exports = router;