import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  PrimaryColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class Settings extends BaseEntity {
  @Field(() => String)
  @PrimaryColumn()
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  prefix: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  hadithChannel: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  hijriChannel: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  quranTranslation: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  hadithLanguage: string;
}
