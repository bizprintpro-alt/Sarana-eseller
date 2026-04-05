import { MongoClient, ObjectId } from "mongodb";

const URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  const client = new MongoClient(URL);
  await client.connect();
  const db = client.db("sarana_shop");

  // Sellers
  const sellers = await db.collection("users").find({role:"seller"}).toArray();
  console.log("Sellers:", sellers.map((u:any)=>u.email));

  // Shops ??????
  const shopDefs = [
    {email:"munkhbat@email.mn", name:"Munkhbat Store", slug:"munkhbat-store", industry:"??????"},
    {email:"muugii@eseller.mn", name:"Muugii Shop", slug:"muugii-shop", industry:"??????????"},
    {email:"lifenews888@gmail.com", name:"LifeNews Store", slug:"lifenews-store", industry:"???? ????"},
    {email:"bat@gmail.com", name:"Bat Shop", slug:"bat-shop", industry:"??? ??????"},
    {email:"mugi@gmail.com", name:"MNSEA Store", slug:"mnsea-store", industry:"???????"},
  ];

  const shopCollection = db.collection("Shop");
  const userMap: Record<string,string> = {};

  for (const def of shopDefs) {
    const user = sellers.find((u:any)=>u.email===def.email);
    if (!user) continue;
    
    const existing = await shopCollection.findOne({slug:def.slug});
    if (!existing) {
      await shopCollection.insertOne({
        _id: new ObjectId(),
        userId: user._id.toString(),
        name: def.name,
        slug: def.slug,
        industry: def.industry,
        logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200",
        isBlocked: false,
        locationStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Shop created:", def.name);
    }
    userMap[def.email] = user._id.toString();
  }

  // products collection-??? ??????????? Product-? ?????
  const oldProducts = await db.collection("products").find({}).toArray();
  console.log("Old products (lowercase):", oldProducts.length);

  const catMap: Record<string,string> = {
    "??????": "munkhbat@email.mn",
    "???? ????": "lifenews888@gmail.com",
    "??????????": "muugii@eseller.mn",
    "??? ??????": "bat@gmail.com",
    "???????": "mugi@gmail.com",
    "?????": "mugi@gmail.com",
    "??? ????": "bat@gmail.com",
  };

  for (const prod of oldProducts) {
    const email = catMap[prod.category] || "munkhbat@email.mn";
    const userId = userMap[email];
    if (!userId) continue;
    
    await db.collection("Product").updateOne(
      {name: prod.name},
      {$set: {userId, isActive: true}},
      {upsert: false}
    );
  }

  // Product collection ???? userId null ??????????? ?????
  const nullProducts = await db.collection("Product").find({userId:null}).toArray();
  console.log("Products with null userId:", nullProducts.length);

  for (const prod of nullProducts) {
    const email = catMap[prod.category] || "munkhbat@email.mn";
    const userId = userMap[email];
    if (!userId) continue;
    await db.collection("Product").updateOne(
      {_id: prod._id},
      {$set: {userId, isActive: true}}
    );
  }

  const total = await db.collection("Product").countDocuments({isActive:true});
  console.log("Active products:", total);

  await client.close();
  console.log("\nFIX COMPLETE");
}
main().catch(console.error);
