import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
const URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";
async function main() {
  const client = new MongoClient(URL);
  await client.connect();
  const db = client.db("sarana_shop");
  const hash = await bcrypt.hash("Eseller2026!", 10);
  await db.collection("users").updateOne(
    {email: "superadmin@eseller.mn"},
    {$set: {password: hash, role: "superadmin"}}
  );
  console.log("Done: superadmin@eseller.mn / Eseller2026!");
  await client.close();
}
main().catch(console.error);
