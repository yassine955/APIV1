import { MyContext } from "src/types";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  InputType,
  Ctx,
  ObjectType,
  UseMiddleware,
} from "type-graphql";
import Axios from "axios";
import { Guild } from "../entities/Guild";
import { isAuth } from "../middleware/isAuth";
import { Settings } from "../entities/Settings";
import { getConnection } from "typeorm";

@ObjectType()
class _CUSTOM_GUILD {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field({ nullable: true })
  icon?: string;
  @Field()
  owner: boolean;
  @Field({ nullable: true })
  permissions: string;
  @Field()
  hasBotInvited: boolean;
}

@InputType()
class InputGuild {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  icon: string;

  @Field()
  owner: boolean;
}
@InputType()
class UpdateSettings {
  @Field({ nullable: true })
  prefix: string;

  @Field({ nullable: true })
  hadithChannel: string;

  @Field({ nullable: true })
  hijriChannel: string;

  @Field({ nullable: true })
  quranTranslation: string;

  @Field({ nullable: true })
  hadithLanguage: string;
}

@Resolver(Guild)
export class GuildResolver {
  // GET MY GUILDS FOR DASHBOARD WEBSITE
  @UseMiddleware(isAuth)
  @Query(() => [_CUSTOM_GUILD])
  async getMyGuilds(@Ctx() { req }: MyContext): Promise<_CUSTOM_GUILD[]> {
    const { data } = await Axios.get(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${req.session.token}`,
        },
      }
    );

    const MYGUILDS: _CUSTOM_GUILD[] = await data
      .filter((guild: _CUSTOM_GUILD) => guild.owner)
      .map(async (guild: _CUSTOM_GUILD) => {
        const findGUILD = await Guild.findOne({
          where: {
            id: guild.id,
          },
        });

        const data = {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          owner: guild.owner,
          permissions: guild.permissions,
          hasBotInvited: !findGUILD ? false : true,
        };

        return data;
      });

    const FETCHEDGUILDS = await Promise.all(MYGUILDS);

    return FETCHEDGUILDS;
  }

  // GET MY ONE PERSONAL GUILD FOR WEBSITE
  @Query(() => Guild, { nullable: true })
  @UseMiddleware(isAuth)
  async getMyOneGuild(@Arg("id") id: string, @Ctx() { req }: MyContext) {
    const { data } = await Axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${req.session.token}`,
      },
    });

    const guild = await Guild.findOne({
      where: {
        id,
      },
      relations: ["settings"],
    });

    if (!guild) return null;

    if (guild.ownerID !== data.id) {
      return null;
    }
    return guild;
  }

  // GET MY GUILD ON DISCORD WITHOUT AUTHENTICATION
  @Query(() => Guild, { nullable: true })
  async getMyOneGuildOnDiscord(@Arg("id") id: string) {
    const guild = await Guild.findOne({
      where: {
        id,
      },
      relations: ["settings"],
    });

    if (!guild) return null;

    return guild;
  }

  // GET ALL GUILDS ADMIN ONLY
  @Query(() => [Guild], { nullable: true })
  async getGuilds() {
    const guilds = await Guild.find({
      relations: ["settings"],
    });
    if (!guilds) return null;

    return guilds;
  }

  // CREATE A GUILD FROM DISCORD WITHOUT AUTHENTICATION
  @Mutation(() => Guild)
  async createGuildFromDiscord(
    @Arg("guild") guild: InputGuild,
    @Arg("ownerid") ownerid: string
  ): Promise<Guild> {
    const resSettings = await Settings.create({
      id: guild.id,
    }).save();

    const result = await Guild.create({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner: guild.owner,
      settingsId: guild.id,
      ownerID: ownerid,
    }).save();
    return result;
  }

  // CREATA A GUILD ON THE DASHBOARD WEBSITE WITH AUTHENTICATION
  @Mutation(() => Guild)
  async createGuild(
    @Arg("guild") guild: InputGuild,
    @Ctx() { req }: MyContext
  ): // @Arg("settings") settings: InputSetting
  Promise<Guild> {
    const { data } = await Axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${req.session.token}`,
      },
    });

    await Settings.create({
      id: guild.id,
    }).save();

    const result = await Guild.create({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner: guild.owner,
      settingsId: guild.id,
      ownerID: data.id,
    }).save();

    return result;
  }

  // UPDATE A GUILD FROM THE DASHBOARD WEBSITE WITH AUTHENTICATION
  @Mutation(() => Settings, { nullable: true })
  async updateGuild(
    @Arg("id", () => String) id: String,
    @Arg("settings") settings: UpdateSettings,
    @Ctx() { req }: MyContext
  ): Promise<Settings | null> {
    const { data } = await Axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${req.session.token}`,
      },
    });

    const findGuild = await Guild.findOne({
      where: {
        id,
      },
    });

    if (!findGuild) {
      return null;
    }

    if (data.id !== findGuild.ownerID) {
      console.log("not the owner");
      return null;
    }

    const result = await getConnection()
      .createQueryBuilder()
      .update(Settings)
      .set({ ...settings })
      .where("id = :id", {
        id,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  // UPDATE A GUILD FROM DISCORD WITHOUT AUTHENTICATION
  @Mutation(() => Settings, { nullable: true })
  async UpdateGuildFromDiscord(
    @Arg("id", () => String) id: String,
    @Arg("settings") settings: UpdateSettings
  ) {
    const findGuild = await Guild.findOne({
      where: {
        id,
      },
    });

    if (!findGuild) {
      console.log("no guild");
      return null;
    }

    const result = await getConnection()
      .createQueryBuilder()
      .update(Settings)
      .set({ ...settings })
      .where("id = :id", {
        id,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  // REMOVE A GUILD IN DB ONLY FROM DISCORD ITSELF, YOU KICK THE BOT YOU WILL GET DELETED..
  @Mutation(() => String)
  async deleteGuild(
    @Arg("id") id: string,
    @Arg("ownerid") ownerid: string
  ): Promise<string> {
    const findmyguild = await Guild.findOne({
      where: { id, ownerID: ownerid },
    });

    const findMySettings = await Settings.findOne({
      where: { id },
    });

    if (findmyguild && findMySettings) {
      await Settings.delete({
        id,
      });

      await Guild.delete({
        id,
        ownerID: ownerid,
      });

      return "Removed Successfully";
    }

    return "Cannot remove that..";
  }
}
