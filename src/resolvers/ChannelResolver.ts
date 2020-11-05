import Axios from "axios";
import { Resolver, Query, Arg, Field, ObjectType } from "type-graphql";

@ObjectType()
class _CUSTOM_CHANNELTYPE {
  @Field()
  id: string;
  @Field()
  type: number;
  @Field()
  name: string;
}

@Resolver()
export class ChannelResolver {
  @Query(() => [_CUSTOM_CHANNELTYPE])
  async getChannelsOfGuild(
    @Arg("channelid") channelID: string
  ): Promise<_CUSTOM_CHANNELTYPE[]> {
    const data: _CUSTOM_CHANNELTYPE[] = await Axios.get(
      `https://discord.com/api/guilds/${channelID}/channels`,
      {
        headers: {
          Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
      }
    )
      .then(async ({ data }) => {
        return await data;
      })
      .catch(() => {
        return false;
      });

    return data;
  }
}
