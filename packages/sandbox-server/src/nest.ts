// import { Inject, Injectable } from '@nestjs/common'
// import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
//
// export const users = pgTable('users', {
//   id: uuid('id').primaryKey(),
//   username: text('username').notNull(),
//   email: text('email').notNull(),
//   password: text('password').notNull(),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// })
//
// import { ConfigService } from '@nestjs/config'
// import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
// import { Pool } from 'pg'
//
// export const DrizzleAsyncProvider = 'DrizzleAsyncProvider'
//
// const schema = {
//   users,
// }
// export const drizzleProvider = [
//   {
//     provide: DrizzleAsyncProvider,
//     inject: [ConfigService],
//     useFactory: async (configService: ConfigService) => {
//       const connectionString = configService.get<string>('DATABASE_URL')
//       const pool = new Pool({
//         connectionString,
//       })
//
//       return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>
//     },
//   },
// ]
//
// import { Module } from '@nestjs/common'
//
// @Module({
//   providers: [...drizzleProvider],
//   exports: [DrizzleAsyncProvider],
// })
// export class DrizzleModule { }
//
// @Injectable()
// export class PostService {
//   constructor(
//     @Inject(DrizzleAsyncProvider)
//     private db: NodePgDatabase<typeof schema>,
//   ) { }
//
//   async createPost() {
//     const hi = await this.db.query.users.findMany()
//   }
// }
//
