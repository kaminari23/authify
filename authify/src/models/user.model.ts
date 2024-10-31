import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar({ length: 50 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    favorite_number: integer().notNull(),
    password: varchar({ length: 255 }).notNull(),

});

