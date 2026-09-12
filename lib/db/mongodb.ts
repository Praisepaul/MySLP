import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "MySLP";

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

const mongoOptions = {
  // Vercel/serverless functions benefit from smaller pools and short idle
  // connection lifetimes. This reduces stale/unused sockets and Atlas
  // connection pressure without adding application-level polling.
  maxPoolSize: 10,
  maxIdleTimeMS: 60_000,

  // Allow Atlas elections/failovers enough time to recover before the request
  // is surfaced as a server-rendering failure.
  serverSelectionTimeoutMS: 15_000,
  connectTimeoutMS: 10_000,

  // Keep the driver's built-in retry behavior enabled for transient failures.
  retryReads: true,
  retryWrites: true,

  // Atlas can return overload signals while a node is unhealthy. Let the
  // driver prefer healthier servers instead of repeatedly targeting an
  // overloaded member.
  enableOverloadRetargeting: true,
  maxAdaptiveRetries: 2,
};

type MongoGlobal = typeof globalThis & {
  __graceMongoClient?: MongoClient;
  __graceMongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as MongoGlobal;

function createMongoClient(): MongoClient {
  return new MongoClient(uri, mongoOptions);
}

function getClientPromise(): Promise<MongoClient> {
  if (globalMongo.__graceMongoClient) {
    return Promise.resolve(globalMongo.__graceMongoClient);
  }

  if (globalMongo.__graceMongoClientPromise) {
    return globalMongo.__graceMongoClientPromise;
  }

  const client = createMongoClient();
  const promise = client.connect().then(() => {
    globalMongo.__graceMongoClient = client;
    return client;
  }).catch(async (error) => {
    await client.close().catch(() => undefined);

    // Do not leave a rejected connection promise cached in a warm server
    // process. A later request must be able to establish a fresh client.
    if (globalMongo.__graceMongoClientPromise === promise) {
      delete globalMongo.__graceMongoClientPromise;
    }

    throw error;
  });

  globalMongo.__graceMongoClientPromise = promise;
  return promise;
}

export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
