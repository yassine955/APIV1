import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { Settings } from "./Settings";

@ObjectType()
@Entity()
export class Guild extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ nullable: true })
  settingsId: string;

  @Field()
  @Column({ nullable: true })
  icon: string;

  @Field()
  @Column()
  owner: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ownerID: string;

  @Column({ nullable: true })
  permissions: number;

  @Column({ nullable: true })
  permissions_new: string;

  @Field({ nullable: true })
  @OneToOne(() => Settings, () => {}, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  settings: Settings;
}
