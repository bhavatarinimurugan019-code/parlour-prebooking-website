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
  GET ALL SERVICES
  GET /api/services
*/
router.get("/", (req, res) => {
  const data = getData();

  res.json({
    success: true,
    services: data.services || []
  });
});

/*
  GET SINGLE SERVICE
  GET /api/services/:id
*/
router.get("/:id", (req, res) => {
  const data = getData();

  const service = (data.services || []).find(
    s => String(s.id) === String(req.params.id)
  );

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  res.json({
    success: true,
    service
  });
});

/*
  ADD NEW SERVICE
  POST /api/services
*/
router.post("/", (req, res) => {
  const data = getData();

  const {
    name,
    category,
    price,
    duration,
    image
  } = req.body;

  if (!name || !category || price === undefined || !duration) {
    return res.status(400).json({
      success: false,
      message: "Name, category, price and duration are required"
    });
  }

  if (!data.services) {
    data.services = [];
  }

  const newId =
    data.services.length > 0
      ? Math.max(...data.services.map(s => Number(s.id) || 0)) + 1
      : 1;

  const newService = {
    id: newId,
    name: name.trim(),
    category: category.trim(),
    price: Number(price) || 0,
    duration: duration.trim(),
    image: image
      ? image.trim()
      : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
  };

  data.services.push(newService);

  saveData(data);

  res.status(201).json({
    success: true,
    message: "Service added successfully",
    service: newService
  });
});

/*
  EDIT / UPDATE SERVICE
  PUT /api/services/:id
*/
router.put("/:id", (req, res) => {
  const data = getData();

  const index = (data.services || []).findIndex(
    s => String(s.id) === String(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  const oldService = data.services[index];

  const {
    name,
    category,
    price,
    duration,
    image
  } = req.body;

  data.services[index] = {
    ...oldService,
    name:
      name !== undefined
        ? String(name).trim()
        : oldService.name,

    category:
      category !== undefined
        ? String(category).trim()
        : oldService.category,

    price:
      price !== undefined
        ? Number(price)
        : oldService.price,

    duration:
      duration !== undefined
        ? String(duration).trim()
        : oldService.duration,

    image:
      image !== undefined
        ? String(image).trim()
        : oldService.image,

    id: oldService.id
  };

  saveData(data);

  res.json({
    success: true,
    message: "Service updated successfully",
    service: data.services[index]
  });
});

/*
  DELETE SERVICE
  DELETE /api/services/:id
*/
router.delete("/:id", (req, res) => {
  const data = getData();

  const index = (data.services || []).findIndex(
    s => String(s.id) === String(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Service not found"
    });
  }

  const deletedService = data.services[index];

  data.services.splice(index, 1);

  saveData(data);

  res.json({
    success: true,
    message: "Service deleted successfully",
    service: deletedService
  });
});

module.exports = router;