import { COOKIE_NAME } from "../constants";
import { MyContext } from "../types";
import { Resolver, Query, Ctx, Mutation } from "type-graphql";

@Resolver()
export class LoginResolver {
  @Mutation(() => Boolean)
  async Logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
