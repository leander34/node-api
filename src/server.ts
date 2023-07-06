import fastify from "fastify"
import { knex } from "./database"

const app = fastify();

app.get("/hello", async (request, reply) => {
  const table = await knex("sqlite_schema").select("*")
  return table
});

app
  .listen({
    port: 3333
  })
  .then(() => {
    console.log("HTTP server running!")
  });
