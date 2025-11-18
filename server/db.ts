import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cachedConnection: typeof mongoose | null = null;

async function dbConnect() {
  if (cachedConnection) {
    return cachedConnection;
  }
  const opts = {
    bufferCommands: false,
  };
  cachedConnection = await mongoose.connect(MONGO_URI, opts);
  return cachedConnection;
}

export default dbConnect;
