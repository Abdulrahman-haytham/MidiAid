const mongoose = require("mongoose");

async function clearDatabase() {
  try {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
    }
    console.log("✅ All fake data deleted. Database is clean now.");
  } catch (err) {
    console.error("❌ Error clearing database:", err);
  }
}
