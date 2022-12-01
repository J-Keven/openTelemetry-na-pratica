require('dotenv/config');
const { DataSource } = require('typeorm');

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_NAME,
  entities: ["src/database/repositories/*.model.ts"],
  migrations: ["src/database/migrations/*.ts"],
});