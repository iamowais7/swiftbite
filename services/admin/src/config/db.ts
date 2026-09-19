import {MongoClient,Db} from "mongodb"
let client: MongoClient;
let db:Db;
export const connectDb = async(): Promise<Db> => {
  if(db) return db;
  client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  // DB_NAME optional - falls back to the database in the URI
  db = client.db(process.env.DB_NAME ?? undefined);
  console.log("Admin service connected to mongodb");
  return db;
};
