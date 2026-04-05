import { MongoClient, ObjectId } from "mongodb";

const DB_URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  const client = new MongoClient(DB_URL);
  await client.connect();
  const db = client.db("sarana_shop");

  // Users
  const users = await db.collection("users").find({}).toArray();
  console.log("Users:", users.length);
  
  const sellers = users.filter((u:any) => u.role === "seller");
  console.log("Sellers:", sellers.map((u:any) => u.email));

  // Products
  const products = await db.collection("products").find({}).toArray();
  console.log("Products:", products.length);
  console.log("Sample product:", JSON.stringify(products[0], null, 2));

  // Collections list
  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map((c:any) => c.name));

  await client.close();
}
main().catch(console.error);
