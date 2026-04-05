import {PrismaClient} from "./src/generated/prisma/client.js";
const p = new PrismaClient();
const total = await p.product.count();
const active = await p.product.count({where:{isActive:true}});
console.log("Total:", total, "Active:", active);
await p.$disconnect();
