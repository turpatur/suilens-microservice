import { Elysia } from "elysia";
import { db } from "./db";
import { inventory } from "./db/schema";
import { eq, and, sql } from "drizzle-orm";

export const routes = new Elysia({ prefix: "/api/inventory" })

  // GET stok per lensa
  .get("/lenses/:lensId", async ({ params }) => {
    return db
      .select({
        branchCode: inventory.branchCode,
        availableQuantity: inventory.availableQuantity,
      })
      .from(inventory)
      .where(eq(inventory.lensId, params.lensId));
  })

  // RESERVE
  .post("/reserve", async ({ body, set }) => {
    const { lensId, branchCode, quantity } = body as any;

    return db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(inventory)
        .where(
          and(
            eq(inventory.lensId, lensId),
            eq(inventory.branchCode, branchCode)
          )
        );

      if (!rows[0] || rows[0].availableQuantity < quantity) {
        set.status = 409;
        return { error: "Insufficient stock" };
      }

      await tx
        .update(inventory)
        .set({
          availableQuantity:
            rows[0].availableQuantity - quantity,
        })
        .where(eq(inventory.id, rows[0].id));

      return { success: true };
    });
  });