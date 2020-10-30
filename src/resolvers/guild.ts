import { Resolver, Query, Mutation, Arg, Field, InputType } from "type-graphql";

import { Guild } from "../entities/Guild";

@InputType()
class InsertGuildInput {
  @Field()
  serverName: string;
  @Field()
  guildId: string;
  @Field()
  ownerId: string;
  @Field()
  prefix: string;
  @Field()
  hadithChannel: string;
  @Field()
  hijriChannel: string;
  @Field()
  hadithLanguage: string;
}

@Resolver(Guild)
export class GuildResolver {
  // FETCH ALL GUILDS FROM DATABASE
  @Query(() => [Guild], { nullable: true })
  async getGuild(): Promise<Guild[] | null> {
    const guild = await Guild.find();
    if (!guild) return null;
    return guild;
  }

  // FETCH ONE GUILD FROM DATABASE
  @Query(() => Guild, { nullable: true })
  async getOneGuild(
    @Arg("guildID", () => String) guildID: number
  ): Promise<Guild | null> {
    const findGuild = await Guild.findOne({
      where: {
        guildId: guildID,
      },
    });
    if (!findGuild) return null;
    return findGuild;
  }

  // INSERT NEW GUILD IN DB
  @Mutation(() => Guild)
  async insertGuild(@Arg("input") input: InsertGuildInput): Promise<Guild> {
    return Guild.create({
      ...input,
    }).save();
  }

  // // UPDATE A GUILD IN DB
  // @Mutation(() => Guild, { nullable: true })
  // async updateGuild(
  //   @Arg("guildID", () => String) guildID: String,
  //   @Arg("serverName") serverName: string
  // ): Promise<Guild | null> {
  //   const result = await getConnection()
  //     .createQueryBuilder()
  //     .update(Guild)
  //     .set({ serverName })
  //     .where("guildID = :guildID", {
  //       guildID,
  //     })
  //     .returning("*")
  //     .execute();

  //   return result.raw[0];
  // }
}
