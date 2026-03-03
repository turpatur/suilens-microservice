import { db } from "./index";
import { inventory } from "./schema";

async function seed() {
  await db.insert(inventory).values([
    {
      lensId: "11111111-1111-1111-1111-111111111111",
      branchCode: "KB-JKT-S",
      totalQuantity: 3,
      availableQuantity: 3,
    },
    {
      lensId: "11111111-1111-1111-1111-111111111111",
      branchCode: "KB-JKT-E",
      totalQuantity: 2,
      availableQuantity: 2,
    },
    {
      lensId: "11111111-1111-1111-1111-111111111111",
      branchCode: "KB-JKT-N",
      totalQuantity: 1,
      availableQuantity: 1,
    },
  ]);

  console.log("Inventory seeded");
  process.exit(0);
}

seed();