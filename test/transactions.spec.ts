import { afterAll, beforeAll, describe, expect, test } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";
import { beforeEach } from "node:test";

describe("Transations routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  test("user can create new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 1000,
        type: "credit",
      })
      .expect(201);
  });

  test("user can list all transactions", async () => {
    const createdTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 1000,
        type: "credit",
      });

    const cookies = createdTransactionResponse.headers["set-cookie"];

    const listTransactions = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactions.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transaction",
        amount: 1000,
      }),
    ]);
  });

  test("user see specific transaction", async () => {
    const createdTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 1000,
        type: "credit",
      });

    const cookies = createdTransactionResponse.headers["set-cookie"];

    const listTransactions = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    const transactionId = listTransactions.body.transactions[0].id;

    const transaction = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(transaction.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transaction",
        amount: 1000,
      }),
    );
  });

  test("user see balance", async () => {
    const creditTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 1000,
        type: "credit",
      });
    const cookies = creditTransactionResponse.headers["set-cookie"];

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "New transaction",
        amount: 200,
        type: "debit",
      });

    const getBalance = await request(app.server)
      .get("/transactions/balance")
      .set("Cookie", cookies)
      .expect(200);

    expect(getBalance.body).toEqual({
      amount: 800,
    });
  });
});
