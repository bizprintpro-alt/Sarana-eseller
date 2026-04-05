import {PrismaClient} from "../src/generated/prisma/client";

const DB_URL = "mongodb+srv://bizprintpro_db_user:sarana123@cluster0.u1ghydc.mongodb.net/sarana_shop?retryWrites=true&w=majority&appName=Cluster0";
const p = new PrismaClient({datasources:{db:{url:DB_URL}}});

async function main() {
  // 1. Seller-?????? ??? shop ??????
  const sellers = [
    { email: "munkhbat@email.mn",    slug: "munkhbat-store",  name: "Munkhbat Store",  industry: "??????" },
    { email: "muugii@eseller.mn",    slug: "muugii-shop",     name: "Muugii Shop",     industry: "??????????" },
    { email: "lifenews888@gmail.com",slug: "lifenews-store",  name: "LifeNews Store",  industry: "???? ????" },
    { email: "bat@gmail.com",        slug: "bat-shop",        name: "Bat Shop",        industry: "??? ??????" },
    { email: "mugi@gmail.com",       slug: "mnsea-store",     name: "MNSEA Store",     industry: "???????" },
  ];

  const shopMap: Record<string, string> = {};

  for (const s of sellers) {
    const user = await p.user.findFirst({where:{email:s.email}});
    if (!user) { console.log("User not found:", s.email); continue; }

    const shop = await p.shop.upsert({
      where: {slug: s.slug},
      update: {},
      create: {
        userId: user.id,
        name: s.name,
        slug: s.slug,
        industry: s.industry,
        logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200",
      }
    });
    shopMap[s.email] = user.id;
    console.log("Shop created:", shop.name, "->", user.email);
  }

  // 2. ??? ??????? userId ??????????
  const products = await p.product.findMany({where:{userId:null}});
  console.log("Products without userId:", products.length);

  const categories: Record<string, string> = {
    "??????": "munkhbat@email.mn",
    "???? ????": "lifenews888@gmail.com",
    "??????????": "muugii@eseller.mn",
    "??? ??????": "bat@gmail.com",
    "???????": "mugi@gmail.com",
    "?????": "mugi@gmail.com",
    "??? ????": "bat@gmail.com",
  };

  for (const prod of products) {
    const sellerEmail = categories[prod.category || "??????"] || "munkhbat@email.mn";
    const userId = shopMap[sellerEmail];
    if (!userId) continue;

    await p.product.update({
      where: {id: prod.id},
      data: {userId, isActive: true}
    });
  }
  console.log("Products updated with userId:", products.length);

  // 3. Platform config
  const configs = [
    {key:"commission_rate", value:"5"},
    {key:"platform_name", value:"eseller.mn"},
    {key:"seller_registration", value:"true"},
  ];
  for (const c of configs) {
    await p.platformConfig.upsert({
      where:{key:c.key}, update:{value:c.value},
      create:{key:c.key, value:c.value}
    });
  }
  console.log("Platform configs set");

  // 4. Superadmin role
  await p.user.updateMany({
    where:{email:"superadmin@eseller.mn"},
    data:{role:"superadmin"}
  });
  await p.user.updateMany({
    where:{email:"admin@eseller.mn"},
    data:{role:"superadmin"}
  });
  console.log("Superadmin roles set");

  console.log("\nSEED COMPLETE");
  await p.$disconnect();
}
main().catch(console.error);
