import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db",
});

const client = new PrismaClient({ adapter });

export const connectToDatabase = async () => {
    await client.$connect();
    console.log("SQLite database connected");
};

export default client;
