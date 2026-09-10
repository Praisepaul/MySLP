import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "grace_sessions";

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

type MongoGlobal = typeof globalThis & {
  __graceMongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as MongoGlobal;

const clientPromise =
  globalMongo.__graceMongoClientPromise ?? new MongoClient(uri).connect();

if (process.env.NODE_ENV !== "production") {
  globalMongo.__graceMongoClientPromise = clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
