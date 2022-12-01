import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class test1669930707394 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "movie",
      columns: [
        {
          name: "id",
          type: "uuid",
          isPrimary: true,
          generationStrategy: "uuid",
          default: "uuid_generate_v4()",
        },
        {
          name: "name",
          type: "varchar",

        },
        {
          name: "bannerUrl",
          type: "varchar",
        },
      ]
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("movie");
  }

}
