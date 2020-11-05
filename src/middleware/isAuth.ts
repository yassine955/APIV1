import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session.token) {
    throw new Error("You are not Authorized to use this API");
  }

  return await next();
};
