import {PrismaClient} from "./src/generated/prisma/client";
const p = new PrismaClient({datasources:{db:{url:"mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0"}}});
async function main() {
  const models = ["user","shop","product","order","service","review","affiliateLink","shopSubscription","platformConfig","conversation","banner","campaign","loyaltyAccount","referral","wishlistItem","preOrderProduct"];
  const r: any = {};
  for (const m of models) {
    try { r[m] = await (p as any)[m].count(); }
    catch(e: any) { r[m] = "ERR: "+e.message.split("\n")[0]; }
  }
  console.log(JSON.stringify(r,null,2));
  await p.$disconnect();
}
main().catch(console.error);
