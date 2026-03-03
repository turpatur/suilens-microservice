import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { routes } from "./routes";
import { startConsumer } from "./consumer";

const app = new Elysia()
  .use(cors())
  .use(routes)
  .get("/health", () => ({
    status: "ok",
    service: "inventory-service",
  }))
  .listen(3003);

startConsumer();

console.log(
  `Inventory Service running at http://localhost:${app.server?.port}`
);