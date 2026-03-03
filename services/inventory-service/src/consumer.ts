import amqplib from "amqplib";
import { db } from "./db";
import { inventory, processedEvents } from "./db/schema";
import { eq, and } from "drizzle-orm";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";

export async function startConsumer() {
  const conn = await amqplib.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();

  await ch.assertExchange("suilens.events", "topic", { durable: true });

  const q = await ch.assertQueue(
    "inventory.order-events",
    { durable: true }
  );

  await ch.bindQueue(
    q.queue,
    "suilens.events",
    "order.cancelled"
  );

  ch.consume(q.queue, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());

      const eventId = event.timestamp;

      const existing = await db
        .select()
        .from(processedEvents)
        .where(eq(processedEvents.eventId, eventId));

      if (existing.length > 0) {
        ch.ack(msg);
        return;
      }

      const { lensId, branchCode, quantity } = event.data;

      const rows = await db
        .select()
        .from(inventory)
        .where(
          and(
            eq(inventory.lensId, lensId),
            eq(inventory.branchCode, branchCode)
          )
        );

      if (rows[0]) {
        await db
          .update(inventory)
          .set({
            availableQuantity:
              rows[0].availableQuantity + quantity,
          })
          .where(eq(inventory.id, rows[0].id));
      }

      await db.insert(processedEvents).values({
        eventId,
      });

      ch.ack(msg);
    } catch (err) {
      ch.nack(msg, false, true);
    }
  });
}