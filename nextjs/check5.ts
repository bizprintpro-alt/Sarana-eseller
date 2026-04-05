import {PrismaClient} from "./src/generated/prisma/client";
const URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";
const p = new PrismaClient({datasources:{db:{url:URL}}});
async function main() {
  const users = await p.user.findMany({select:{id:true,email:true,name:true,role:true}});
  console.log("USERS:", JSON.stringify(users,null,2));
  const prods = await p.product.findMany({select:{id:true,name:true,price:true,images:true,category:true,userId:true},take:5});
  console.log("PRODUCTS sample:", JSON.stringify(prods,null,2));
  await p.$disconnect();
}
main().catch(console.error);
