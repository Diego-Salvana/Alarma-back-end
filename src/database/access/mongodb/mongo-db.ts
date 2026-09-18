import 'dotenv/config';
import mongoose from 'mongoose';

export class MongoDB {
  private static readonly connectionString = process.env.MONGO_URI ?? '';

  static connect () {
    mongoose.connect(this.connectionString)
      .then(() => console.log('Connected to MongoDB 📖'))
      .catch(() => console.log('Failed to connect to MongoDB'));
  }
}
