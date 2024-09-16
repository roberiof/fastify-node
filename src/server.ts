import "dotenv/config";
import fastify from "fastify";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";
import cookie from "@fastify/cookie";

const app = fastify();

app.register(cookie);
app.register(transactionsRoutes, { prefix: "transactions" });

app.listen({ port: parseInt(env.PORT) }).then(() => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
