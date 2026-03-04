import { db } from ".";
import { branches, inventory } from "./schema";

const BRANCH_CODES = ['KB-JKT-S', 'KB-JKT-E', 'KB-JKT-N'];

export async function seedBranches() {
  const existing = await db.select().from(branches);

  if (existing.length > 0) {
    console.log('Branches already seeded');
    return;
  }

  await db.insert(branches).values([
    {
      code: 'KB-JKT-S',
      name: 'Komet Biru Jakarta Selatan',
      city: 'Jakarta',
    },
    {
      code: 'KB-JKT-E',
      name: 'Komet Biru Jakarta Timur',
      city: 'Jakarta',
    },
    {
      code: 'KB-JKT-N',
      name: 'Komet Biru Jakarta Utara',
      city: 'Jakarta',
    },
  ]);

  console.log('Branch seeding completed');
}

export async function seedInventory() {
  const existing = await db.select().from(inventory);

  if (existing.length > 0) {
    console.log('Inventory already seeded');
    return;
  }

  let lenses = [];
  let retries = 10;
  const catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:3001';

  while (retries > 0) {
    try {
      const response = await fetch(`${catalogUrl}/api/lenses`);
      if (response.ok) {
        lenses = await response.json();
        if (lenses.length > 0) {
          break;
        }
      }
    } catch (error) {
    }
    retries--;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  if (lenses.length === 0) {
    console.error('Failed to fetch lenses from catalog service');
    process.exit(1);
  }

  const inventoryValues = [];
  for (const lens of lenses) {
    for (const branchCode of BRANCH_CODES) {
      inventoryValues.push({
        lensId: lens.id,
        branchCode,
        stock: 5,
      });
    }
  }

  await db.insert(inventory).values(inventoryValues);

  console.log('Inventory seeding completed');
}

async function seed() {
  console.log('Seeding inventory service...');
  await seedBranches();
  await seedInventory();
  console.log('Seeding finished.');
  process.exit(0);
}

if (import.meta.main) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}