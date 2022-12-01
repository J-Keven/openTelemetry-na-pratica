import logger from "../logger";
import { DataSource } from "typeorm";
import dataSource from "../../ormconfig";

export default class Database {
  private connection: DataSource;
  private static instance: Database;

  private constructor(connection: DataSource) {
    this.connection = connection;
  }

  public static async connect(): Promise<Database> {
    if (!Database.instance) {
      const connection = dataSource;
      await connection.initialize();
      const instance = new Database(connection);
      Database.instance = instance;
    }

    return Database.instance;
  }

  public static get connection(): DataSource {
    if (!Database.instance) {
      logger.error("Database not connected");
    }

    return Database.instance.connection;
  }
}