import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from './db';
import { inventory } from './db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { startConsumer } from './events';

const app = new Elysia()
  .use(cors())
  .post('/api/inventory/reserve', async ({ body }) => {
    const item = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.lensId, body.lensId),
          eq(inventory.branchCode, body.branchCode)
        )
      );

    if (!item[0] || item[0].stock < body.quantity) {
      return new Response(
        JSON.stringify({ error: 'Insufficient stock' }),
        { status: 409 }
      );
    }

    await db
      .update(inventory)
      .set({
        stock: sql`${inventory.stock} - ${body.quantity}`,
      })
      .where(
        and(
          eq(inventory.lensId, body.lensId),
          eq(inventory.branchCode, body.branchCode)
        )
      );

    return new Response(
      JSON.stringify({ message: 'Stock reserved' }),
      { status: 200 }
    );
  }, {
    body: t.Object({
      orderId: t.String(),
      lensId: t.String(),
      branchCode: t.String(),
      quantity: t.Number(),
    }),
  })

  .get('/api/inventory', async () =>
    db.select().from(inventory)
  )

  .get('/health', () => ({
    status: 'ok',
    service: 'inventory-service',
  }))

  .listen(3003);

console.log(`Inventory Service running on port ${app.server?.port}`);
startConsumer();