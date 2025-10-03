import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'turf_booking';

if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // Allows attaching to the global object in development mode
  // @ts-ignore
  var _mongoClientPromise: Promise<MongoClient>;
  var _mongoose: any;
}

// MongoDB Client Connection (for direct MongoDB operations)
if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the client is not recreated on every file change
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new MongoClient instance
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Mongoose Connection (for schema-based operations)
export const connectMongoDB = async () => {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoose) {
      // Ensure we're connecting to the correct database
      global._mongoose = mongoose.connect(uri, {
        dbName: dbName
      });
    }
    return global._mongoose;
  } else {
    return mongoose.connect(uri, {
      dbName: dbName
    });
  }
};

export default clientPromise;
