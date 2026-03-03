import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  lensId: uuid("lens_id").notNull(),
  branchCode: varchar("branch_code", { length: 20 }).notNull(),
  totalQuantity: integer("total_quantity").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const processedEvents = pgTable("processed_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});