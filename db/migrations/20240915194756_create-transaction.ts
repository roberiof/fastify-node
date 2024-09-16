import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary();
    table.string("title").notNullable();
    table.decimal("amount", 10, 2).notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable("transactions");
  if (exists) {
    await knex.schema.dropTable("transactions");
  }
}
