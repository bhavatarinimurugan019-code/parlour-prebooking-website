const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const DATA_FILE = path.join(__dirname, "data.json");
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const DATABASE_NAME = process.env.MONGODB_DB || "kiruthis_parlour";

let clientPromise;
let seedPromise;

function readFileData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { services: [], bookings: [], gallery: [] };
    }

    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    console.error("Data read error:", error);
    return { services: [], bookings: [], gallery: [] };
  }
}

async function getDatabase() {
  if (!MONGODB_URI) {
    return null;
  }

  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000
    });

    clientPromise = client.connect().catch(error => {
      clientPromise = null;
      throw error;
    });
  }

  const client = await clientPromise;
  return client.db(DATABASE_NAME);
}

async function initializeDatabase() {
  const database = await getDatabase();

  if (!database) {
    console.warn("MONGODB_URI is not configured; using data.json fallback.");
    return;
  }

  await seedDatabase(database);

  console.log(`MongoDB connected: ${DATABASE_NAME}`);
}

async function seedDatabase(database) {
  if (!seedPromise) {
    seedPromise = (async () => {
      const source = readFileData();
      const collections = ["services", "bookings", "gallery"];

      for (const collectionName of collections) {
        const collection = database.collection(collectionName);
        const count = await collection.countDocuments();

        if (count === 0 && source[collectionName]?.length) {
          const documents = source[collectionName].map(value =>
            collectionName === "gallery" ? { value } : value
          );

          await collection.insertMany(documents);
        }
      }
    })();
  }

  return seedPromise;
}

async function getData() {
  const database = await getDatabase();

  if (!database) {
    return readFileData();
  }

  await seedDatabase(database);

  const [services, bookings, gallery] = await Promise.all([
    database.collection("services").find({}).toArray(),
    database.collection("bookings").find({}).toArray(),
    database.collection("gallery").find({}).toArray()
  ]);

  return {
    services,
    bookings,
    gallery: gallery.map(item => item.value)
  };
}

async function saveData(data) {
  const database = await getDatabase();

  if (!database) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return;
  }

  const operations = [
    ["services", data.services || [], item => item],
    ["bookings", data.bookings || [], item => item],
    ["gallery", data.gallery || [], value => ({ value })]
  ];

  for (const [collectionName, values, transform] of operations) {
    const collection = database.collection(collectionName);
    await collection.deleteMany({});

    if (values.length) {
      await collection.insertMany(values.map(transform));
    }
  }
}

module.exports = {
  getData,
  initializeDatabase,
  saveData
};