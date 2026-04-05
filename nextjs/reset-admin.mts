import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
const URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";
async function main() {
  const client = new MongoClient(URL);
  await client.connect();
  const db = client.db("sarana_shop");
  const hash = await bcrypt.hash("password123", 10);
  await db.collection("users").updateMany(
    {email: {$in: ["admin@eseller.mn","superadmin@eseller.mn"]}},
    {$set: {password: hash, role: "superadmin"}}
  );
  console.log("Password reset to: password123");
  console.log("Role set to: superadmin");
  await client.close();
}
main().catch(console.error);
