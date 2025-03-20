const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect('mongodb+srv://hakeem515kom:0930112994@learnig-mongo-db.c7ehndp.mongodb.net/');
        console.log(`MongoDB has been connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;