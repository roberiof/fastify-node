import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import checkSessionIdExist from "../middlewares/check-session-id-exist";

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  app.get("/", { preHandler: [checkSessionIdExist] }, async (request) => {
    const { session_id } = request.cookies;

    const transactions = await knex
      .from("transactions")
      .where("session_id", session_id)
      .select("*");

    return { transactions };
  });

  app.get("/:id", { preHandler: [checkSessionIdExist] }, async (request) => {
    const getIdSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getIdSchema.parse(request.params);

    const transaction = await knex
      .from("transactions")
      .where({ id, session_id: request.cookies.session_id })
      .first();

    return { transaction };
  });

  app.get(
    "/balance",
    { preHandler: [checkSessionIdExist] },
    async (request) => {
      const sum = await knex
        .from("transactions")
        .where("session_id", request.cookies.session_id)
        .sum("amount", { as: "amount" })
        .first();

      return sum;
    },
  );

  app.post("/", async (request, reply) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionSchema.parse(request.body);

    const session_id = request.cookies.session_id;

    if (!session_id) {
      reply.cookie("session_id", randomUUID(), {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id,
    });

    return reply.status(201).send();
  });
}
