import { MongoClient, ObjectId } from "mongodb";
const URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";
async function main() {
  const client = new MongoClient(URL);
  await client.connect();
  const db = client.db("sarana_shop");
  const catMap: Record<string,string> = {
    "??????":"69ab2b082c681dd8020e77e2",
    "???? ????":"69cf55010a9acdca9b7958e6",
    "??????????":"69ceada2bc6742579f48dfc9",
    "??? ??????":"69cfdd89fa67fa24872c2eda",
    "???????":"69d08d7d973c0d95a00f1c6e",
    "?????":"69d08d7d973c0d95a00f1c6e",
    "??? ????":"69cfdd89fa67fa24872c2eda",
  };
  const prods = await db.collection("products").find({}).toArray();
  console.log("Copying", prods.length, "products...");
  for (const p of prods) {
    const userId = catMap[p.category] || "69ab2b082c681dd8020e77e2";
    const existing = await db.collection("Product").findOne({name:p.name});
    if (!existing) {
      await db.collection("Product").insertOne({
        ...p,
        _id: new ObjectId(),
        userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Copied:", p.name);
    } else {
      await db.collection("Product").updateOne({name:p.name},{$set:{userId,isActive:true}});
      console.log("Updated:", p.name);
    }
  }
  const total = await db.collection("Product").countDocuments({isActive:true});
  console.log("Total active products:", total);
  await client.close();
}
main().catch(console.error);
