module.exports = {
  name: "default",
  type: "postgres",
  host: process.env.POSTGRES_HOST || "sql_db",
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || "subscription",
  username: process.env.POSTGRES_USERNAME || "postgres",
  password: process.env.POSTGRES_PASSWORD || "docker",
  entities: ["./src/application/**/infra/repository/typeorm/*.model.ts"],
  migrations: ["./src/infra/database/typeorm/migrations/*.ts"],
  cli: {
    migrationsDir: "./src/infra/database/typeorm/migrations/",
  },
  namingStrategy: new SnakeNamingStrategy(),
}
