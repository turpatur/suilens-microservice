import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  primaryKey
} from 'drizzle-orm/pg-core';

export const branches = pgTable('branches', {
  code: varchar('code', { length: 20 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
});

export const inventory = pgTable('inventory', {
  lensId: uuid('lens_id').notNull(),
  branchCode: varchar('branch_code', { length: 20 })
    .references(() => branches.code)
    .notNull(),
  stock: integer('stock').notNull(),
}, (table) => ({
  pk: primaryKey({
    columns: [table.lensId, table.branchCode],
  }),
}));

export const reservations = pgTable('reservations', {
  orderId: uuid('order_id').primaryKey(),
  lensId: uuid('lens_id').notNull(),
  branchCode: varchar('branch_code', { length: 20 }).notNull(),
  quantity: integer('quantity').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // reserved | released
  createdAt: timestamp('created_at').defaultNow().notNull(),
});