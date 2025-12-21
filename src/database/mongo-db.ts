import 'dotenv/config';
import mongoose from 'mongoose';

/** Clase que maneja la conxión a la base de datos. */
export class MongoDB {
  private static readonly connectionString = process.env.MONGO_URI ?? '';

  static connect () {
    mongoose.connect(this.connectionString)
      .then(() => console.log('Connected to MongoDB 📖'))
      .catch(() => console.log('Failed to connect to MongoDB'));
  }
}
