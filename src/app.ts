import fastify from "fastify"
import { knex } from "./database"
import crypto from 'node:crypto'
import { env } from "./env";
import { transactionsRouter } from "./routes/transactions";
import cookie from '@fastify/cookie'
export const app = fastify();


app.register(cookie)

app.register(transactionsRouter, {
  prefix: '/transactions'
})
