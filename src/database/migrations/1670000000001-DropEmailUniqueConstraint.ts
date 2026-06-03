import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropEmailUniqueConstraint1670000000001 implements MigrationInterface {
  name = 'DropEmailUniqueConstraint1670000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the remaining unique constraint on the email column in the "user" table
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "UQ_e12875dfb3b1d92d7d7c5377e22"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the unique constraint on email (in case of rollback)
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
  }
}
