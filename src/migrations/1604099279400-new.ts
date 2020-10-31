import {MigrationInterface, QueryRunner} from "typeorm";

export class new1604099279400 implements MigrationInterface {
    name = 'new1604099279400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "guild" ("id" SERIAL NOT NULL, "serverName" character varying NOT NULL, "guildId" character varying NOT NULL, "ownerId" character varying NOT NULL, "prefix" character varying NOT NULL, "hadithChannel" character varying NOT NULL, "hijriChannel" character varying NOT NULL, "hadithLanguage" character varying NOT NULL, "version" character varying NOT NULL, CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "guild"`);
    }

}
