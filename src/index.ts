import "reflect-metadata";
import "dotenv-safe/config";
import { __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection, ConnectionOptions } from "typeorm";

import path from "path";

import { Guild } from "./entities/Guild";
import { GuildResolver } from "./resolvers/guild";

const options: ConnectionOptions = {
  name: "default",
  type: "sqlite",
  database: `${path.join(__dirname, "./db.sqlite")}`,
  entities: [Guild, HelloResolver],
  logging: true,
  migrationsRun: true,
  migrations: [path.join(__dirname, "./migrations/*")],
  synchronize: true,
  cli: {
    migrationsDir: "migrations",
  },
};

const main = async () => {
  const connection = await createConnection(options);

  await connection.runMigrations({}).then((res) => console.log(res));

  const app = express();

  // const RedisStore = connectRedis(session);
  // const redis = new Redis(process.env.REDIS_URL);
  // app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  // app.use(
  //   session({
  //     name: COOKIE_NAME,
  //     store: new RedisStore({
  //       client: redis,
  //       disableTouch: true,
  //     }),
  //     cookie: {
  //       maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
  //       httpOnly: true,
  //       sameSite: "lax", // csrf
  //       secure: __prod__, // cookie only works in https
  //       domain: __prod__ ? ".codeponder.com" : undefined,
  //     },
  //     saveUninitialized: false,
  //     secret: process.env.SESSION_SECRET,
  //     resave: false,
  //   })
  // );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, GuildResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      // redis,
      // userLoader: createUserLoader(),
      // updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.use("/", (_, res) => {
    return res.status(200).send(`http://localhost:${process.env.PORT}`);
  });

  app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
