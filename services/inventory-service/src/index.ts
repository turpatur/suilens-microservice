import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from './db';
import { inventory, reservations } from './db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { startConsumer } from './events';

const app = new Elysia()
  .use(cors())
  .get('/api/inventory/lenses/:lensId', async ({ params }) => {
    const items = await db
      .select()
      .from(inventory)
      .where(eq(inventory.lensId, params.lensId));

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Lens not found' }),
        { status: 404 }
      );
    }

    return items.map(item => ({
      branchCode: item.branchCode,
      availableQuantity: item.stock,
    }));
  })

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
        JSON.stringify({ error: 'OUT_OF_STOCK', message: `Not enough stock at branch ${body.branchCode}` }),
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

    await db
      .insert(reservations)
      .values({
        orderId: body.orderId,
        lensId: body.lensId,
        branchCode: body.branchCode,
        quantity: body.quantity,
        status: 'reserved',
      });

    return new Response(
      JSON.stringify({ 
        status: 'reserved',
        orderId: body.orderId,
        lensId: body.lensId,
        branchCode: body.branchCode,
        quantity: body.quantity
      }),
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