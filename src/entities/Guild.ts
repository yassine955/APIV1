import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@ObjectType()
@Entity()
export class Guild extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  serverName!: string;

  @Field()
  @Column()
  guildId!: string;

  @Field()
  @Column()
  ownerId!: string;

  @Field()
  @Column()
  prefix!: string;

  @Field()
  @Column()
  hadithChannel!: string;

  @Field()
  @Column()
  hijriChannel!: string;

  @Field()
  @Column()
  hadithLanguage!: string;
}
