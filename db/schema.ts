import {integer,sqliteTable,text} from "drizzle-orm/sqlite-core";
export const projects=sqliteTable("projects",{id:text("id").primaryKey(),owner:text("owner").notNull(),config:text("config").notNull(),secret:text("secret").notNull(),created:integer("created").notNull()});
export const settings=sqliteTable("settings",{key:text("key").primaryKey(),value:text("value").notNull()});
export const sessions=sqliteTable("sessions",{id:text("id").primaryKey(),project:text("project").notNull(),plan:text("plan").notNull(),reference:text("reference").notNull(),subscription:text("subscription").unique(),status:text("status").notNull(),created:integer("created").notNull()});
export const deliveries=sqliteTable("deliveries",{id:text("id").primaryKey(),project:text("project").notNull(),body:text("body").notNull(),delivered:integer("delivered").notNull().default(0),attempts:integer("attempts").notNull().default(0),created:integer("created").notNull()});
export const limits=sqliteTable("limits",{key:text("key").primaryKey(),count:integer("count").notNull()});
