import {PrismaClient} from "./src/generated/prisma/client";
const p = new PrismaClient({datasources:{db:{url:"mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0"}}});
async function main() {
  const users = await p.user.count();
  const shops = await p.shop.count();
  const products = await p.product.count();
  console.log("Users:", users, "Shops:", shops, "Products:", products);
  await p.$disconnect();
}
main().catch(console.error);
