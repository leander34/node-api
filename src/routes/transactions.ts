import { FastifyInstance } from "fastify";
import { knex } from "../database";
import crypto, { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";


export async function transactionsRouter(app: FastifyInstance) {
    // app.addHook('preHandler', checkSessionIdExists)
    app.addHook('preHandler', async (request) => {
        console.log(`[${request.method}] ${request.url}`)
    })
    app.get('/', {
        preHandler: [checkSessionIdExists],
    } , async (request, reply) => {
        const { sessionId } = request.cookies
       
        const transactions = await knex('transactions').where('session_id', sessionId).select()
        return {
            transactions
        }
    })

    app.get('/:id', {
        preHandler: [checkSessionIdExists],
    } , async (request) => {
        const { sessionId } = request.cookies
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })
        const { id } = getTransactionParamsSchema.parse(request.params)
        // const transaction = await knex('transactions').where('id', id).andWhere('session_id', sessionId).first()
        const transaction = await knex('transactions').where({
            id: id,
            session_id: sessionId
        }).first()

        return {transaction}
    })

    app.get('/summary', {
        preHandler: [checkSessionIdExists],
    } , async (request) => {
        const { sessionId } = request.cookies
        const summary = await knex('transactions').where('session_id', sessionId).sum('amount', {
             as: 'amount'
        }).first()

        return {
            summary
        }
    })

    app.post("/", async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string().nonempty(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

    const { title, amount, type }  = createTransactionBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if(!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
            path: '/',
            // expires: new Date('2023-12-01') // objeto data com a expiração exata
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dayjs // tempo em milisegundo para o cookie expirar
        })
    }
    await knex('transactions').insert({
        id: crypto.randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId
    })

  return reply.status(201).send()
});
}