import { MongoClient } from "mongodb";
const URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";
async function main() {
  const client = new MongoClient(URL);
  await client.connect();
  const db = client.db("sarana_shop");
  const admin = await db.collection("users").findOne({email:"admin@eseller.mn"});
  console.log("Admin:", JSON.stringify({email:admin?.email, role:admin?.role, passwordHash:admin?.password?.substring(0,20)+"..."}));
  const superadmin = await db.collection("users").findOne({email:"superadmin@eseller.mn"});
  console.log("Superadmin:", JSON.stringify({email:superadmin?.email, role:superadmin?.role, passwordHash:superadmin?.password?.substring(0,20)+"..."}));
  await client.close();
}
main().catch(console.error);
