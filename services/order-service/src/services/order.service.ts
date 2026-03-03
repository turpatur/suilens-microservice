import { db } from '../db';
import { orders } from '../db/schema';
import { publishEvent } from '../events';

// URL Catalog Service. Saat di Docker, gunakan nama service (catalog-service:3001)
const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:3001';

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  lensId: string;
  startDate: string;
  endDate: string;
}

export const OrderService = {
  async createOrder(input: CreateOrderInput) {
    // 1. Panggil Catalog Service via HTTP (Sinkron) [cite: 602]
    const response = await fetch(`${CATALOG_URL}/api/lenses/${input.lensId}`);
    if (!response.ok) {
      throw new Error('Lens not found or Catalog Service unavailable');
    }
    const lens = await response.json();

    // 2. Kalkulasi harga
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) throw new Error('End date must be after start date');
    const totalPrice = (days * parseFloat(lens.dayPrice)).toFixed(2);

    // 3. Simpan Pesanan (termasuk snapshot) 
    const [order] = await db.insert(orders).values({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      lensId: input.lensId,
      lensSnapshot: { modelName: lens.modelName, dayPrice: lens.dayPrice }, // Snapshot [cite: 595]
      startDate: start,
      endDate: end,
      totalPrice,
    }).returning();

    // 4. Publikasikan Event ke RabbitMQ (Asinkron) 
    await publishEvent('order.placed', {
      orderId: order.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      lensName: lens.modelName,
    });

    return order;
  }
};