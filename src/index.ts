import "reflect-metadata";
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ } from "./constants";
import express, { Request, Response } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection, ConnectionOptions } from "typeorm";
import fetch from "node-fetch";

import path from "path";

import { Guild } from "./entities/Guild";

import Axios from "axios";
import { Settings } from "./entities/Settings";
import { GuildResolver } from "./resolvers/GuildResolver";
import { LoginResolver } from "./resolvers/LoginResolver";
import { ChannelResolver } from "./resolvers/ChannelResolver";

const options: ConnectionOptions = {
  type: "postgres",
  synchronize: true,
  url: process.env.DATABASE_URL,
  logging: false,
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [Guild, Settings],
};

const main = async () => {
  const connection = await createConnection(options);

  // await connection.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? ".servantofallah.xyz" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, GuildResolver, LoginResolver, ChannelResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.use("/oauth/login", (_, res: Response) => {
    return res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${
        process.env.CLIET_ID
      }&redirect_uri=${encodeURIComponent(
        process.env.callbackUrl
      )}&response_type=code&scope=${encodeURIComponent("identify guilds")}`
    );
  });

  app.use("/oauth/callback", (req: Request, res: Response) => {
    fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      //@ts-ignore
      body: new URLSearchParams({
        client_id: process.env.CLIET_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: process.env.callbackUrl,
        scope: "identify",
      }),
    }).then(async (response) => {
      const dataFetch = await response.json();
      req.session!.token = dataFetch["access_token"];

      res.redirect(process.env.redirectUrl);
    });
  });

  app.use("/oauth/logout", (req: Request, res: Response) => {
    req.session!.destroy(null!);
    return res.status(200).send({
      msg: "destroyed",
    });
  });

  app.use("/oauth/details", async (req: Request, res: Response) => {
    if (!req.session!.token)
      return res.status(401).send({
        msg: "YOU ARE NOT LOGGED IN",
      });

    const { data } = await Axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${req.session!.token}`,
      },
    });

    return res.status(200).send({
      _user: data,
    });
  });

  app.use("/oauth/guild-join", async (req: Request, res: Response) => {
    //   https://discord.com/api/oauth2/authorize?client_id=733637168127279124&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Foauth%2Fguild-join&scope=bot

    if (req.query.guild_id) {
      // req.session!.CURRENT_GUILD = req.query.guild_id;

      let query = `query GetMyOneGuildVerification($id: String!) {
                    getMyOneGuildOnDiscord(id: $id) {
                      id
                      name
                      settingsId
                      ownerID
                      owner
                    }
                  }
                  `;

      setTimeout(async () => {
        const data = await fetch(`${process.env.API_URI}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            query,
            variables: { id: String(req.query.guild_id) },
          }),
        }).then(async (r) => await r.json());

        if (data.data.getMyOneGuildOnDiscord.id) {
          res.redirect(
            `${process.env.redirectUrl}/myguild/${data?.data?.getMyOneGuildOnDiscord?.id}`
          );
        } else {
          res.redirect(`${process.env.redirectUrl}/dashboard`);
        }
      }, 2000);

      //  if (data?.data?.getMyOneGuildOnDiscord?.id) {
      //    console.log(data?.data);

      //  }

      // Axios.post(
      //   "http://localhost:4000/graphql",
      //   {
      // ,
      //   },
      //   {
      //     method: "POST",
      //   }
      // ).then((res) => console.log(res));

      // setTimeout(() => {
      //   res.redirect("http://localhost:3000/create_guild");
      // }, 3000);

      // res.redirect("http://localhost:3000/create_guild");
    }

    // if (req.query.guild_id) {
    //   req.session!.CURRENT_GUILD = req.query.guild_id;

    //   res.redirect("http://localhost:3000/create_guild");

    //   return res.status(200).send({
    //     GUILDID: req.query.guild_id,
    //   });
    // } else {
    //   return res.status(403).send(true);
    // }
  });

  app.use("/oauth/guild-fetch", async (req: Request, res: Response) => {
    const { data } = await Axios.get(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${req.session!.token}`,
        },
      }
    );

    const currentGUILD = await data.filter(
      (guild: any) => guild.id === req.session!.CURRENT_GUILD
    )[0];

    if (req.session!.CURRENT_GUILD) {
      return res.status(200).send({
        client: req.session!.CURRENT_GUILD,
        guild: currentGUILD,
      });
    } else
      return res.status(403).send({
        msg: false,
      });
  });

  app.use("/oauth/guild-channels", async (req: Request, res: Response) => {
    await Axios.get(
      `https://discord.com/api/guilds/${req.headers.channel}/channels`,
      {
        headers: {
          Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
      }
    )
      .then(({ data }) => {
        return res.status(200).send({
          channels: data,
        });
      })
      .catch((er) => console.error(er));
  });

  app.use("/", async (_: Request, res: Response) => {
    res.status(200).send({
      msg: "WELCOME TO MY API",
      status: 200,
    });
  });

  app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
