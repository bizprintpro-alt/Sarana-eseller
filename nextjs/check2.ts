import {PrismaClient} from "./src/generated/prisma/client";
const p = new PrismaClient();
async function main() {
  const shops = await p.shop.findMany({select:{id:true,name:true,userId:true}});
  console.log(JSON.stringify(shops,null,2));
  const prods = await p.product.findMany({take:3});
  console.log("Products:", JSON.stringify(prods,null,2));
  await p.$disconnect();
}
main().catch(console.error);
