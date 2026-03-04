import amqplib from 'amqplib';
import { db } from './db';
import { inventory } from './db/schema';
import { and, eq, sql } from 'drizzle-orm';

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

const EXCHANGE_NAME = 'suilens.events';
const QUEUE_NAME = 'inventory-service';

export async function startConsumer() {
  const connection = await amqplib.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', {
    durable: true,
  });

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  await channel.bindQueue(
    QUEUE_NAME,
    EXCHANGE_NAME,
    'order.cancelled'
  );

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());

    if (content.event === 'order.cancelled') {
      const { lensId, branchCode, quantity } = content.data;

      console.log('Releasing stock for cancelled order');

      await db
        .update(inventory)
        .set({
          stock: sql`${inventory.stock} + ${quantity}`,
        })
        .where(
          and(
            eq(inventory.lensId, lensId),
            eq(inventory.branchCode, branchCode)
          )
        );
    }

    channel.ack(msg);
  });

  console.log('Inventory consumer started');
}