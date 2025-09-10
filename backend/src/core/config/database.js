const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) return;

    mongoose.set('strictQuery', false);

   const conn = await mongoose.connect(process.env.MongoURI, {
  dbName: process.env.DB_NAME || 'default-db'
});


    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error; 
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close(false);
    console.log('✅ MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error while closing MongoDB:', error);
    throw error;
  }
};

module.exports = { connectDB, closeDB };
