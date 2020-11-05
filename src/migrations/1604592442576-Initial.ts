import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1604592442576 implements MigrationInterface {
    name = 'Initial1604592442576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" ("id" character varying NOT NULL, "prefix" character varying, "hadithChannel" character varying, "hijriChannel" character varying, "quranTranslation" character varying, "hadithLanguage" character varying, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guild" ("id" character varying NOT NULL, "name" character varying NOT NULL, "settingsId" character varying, "icon" character varying, "owner" boolean NOT NULL, "ownerID" character varying, "permissions" integer, "permissions_new" character varying, CONSTRAINT "REL_05b1d799456b8667ba89df7194" UNIQUE ("settingsId"), CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "guild" ADD CONSTRAINT "FK_05b1d799456b8667ba89df7194b" FOREIGN KEY ("settingsId") REFERENCES "settings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild" DROP CONSTRAINT "FK_05b1d799456b8667ba89df7194b"`);
        await queryRunner.query(`DROP TABLE "guild"`);
        await queryRunner.query(`DROP TABLE "settings"`);
    }

}
