import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vamsi:podilikrish@sam-cluster.t2gd0s8.mongodb.net/?appName=SAM-Cluster');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    console.warn(`⚠️ Warning: Database connection failed. The server will stay alive but features requiring a database will error.`);
  }
};

export default connectDB;
