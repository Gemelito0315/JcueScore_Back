import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEmailUniqueIndex1670000000000 implements MigrationInterface {
  name = 'RemoveEmailUniqueIndex1670000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Elimina la restricción UNIQUE del campo email en la tabla "user"
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "UQ_user_email"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaura la restricción UNIQUE del campo email (en caso de rollback)
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_user_email" UNIQUE ("email")`);
  }
}
