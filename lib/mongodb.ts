import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to .env.local — see .env.example.");
}
const dbName = process.env.MONGODB_DB ?? "healthy-you-by-ruhma";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Cache the connection promise on globalThis in dev so HMR doesn't open a new pool every save.
const clientPromise: Promise<MongoClient> =
  process.env.NODE_ENV === "production"
    ? new MongoClient(uri).connect()
    : (globalThis._mongoClientPromise ??= new MongoClient(uri).connect());

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
