import 'dotenv/config';
import mongoose from 'mongoose';

export async function connectMongo (): Promise<void> {
  if (mongoose.connection.readyState !== 0) return;

  const connectionString = process.env.MONGO_URI;
  
  if (!connectionString) throw new Error('MONGO_URI not configured');

  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB 📖');
  } catch {
    console.error('Failed to connect to MongoDB');
  }
}
