import {PrismaClient} from "./src/generated/prisma/client";
const p = new PrismaClient();
async function main() {
  const total = await p.product.count();
  const active = await p.product.count({where:{isActive:true}});
  const shops = await p.shop.count();
  console.log("Products total:", total);
  console.log("Products active:", active);
  console.log("Shops:", shops);
  await p.$disconnect();
}
main();
