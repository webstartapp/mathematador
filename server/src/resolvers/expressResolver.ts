import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { ContextType, LocalResolverType, Viewer } from "./expressTypeResolver";
import { UserDB } from "../entities/user/user";
import { apiResolvers, ITokenBody, IUserRoles } from "@/_generated/sessionOperations";
import { tokenContext } from "@/utils/JWT";
import knex from "@/knexWrapper";

const router = Router();

export type ExpressRouteType<ARGS extends Record<string, any> = any, RET extends Record<string, any> = any> = {
  path: `/${string}`;
  method: "get" | "post" | "put" | "delete";
  resolver: LocalResolverType<ARGS, RET>;
  security?: string[];
};

const getViewer = async (req: Request) => {
  const session = req.headers?.authorization || (req.headers?.Authorization as string);
  if (!session) {
    throw new Error("No session");
  }
  const token = session.split(" ")[1];
  const sessionData = tokenContext(token);
  if (!sessionData?.userId) {
    throw new Error("Invalid session");
  }
  let viewer = await knex("users").where("id", sessionData.userId).first();
  if (!viewer) {
    await knex("users")
      .insert({
        id: sessionData.userId,
        role: IUserRoles.User
      })
      .returning("*");
    viewer = await knex("users").where("id", sessionData.userId).first();
  }

  if (!viewer) {
    throw new Error("User not found");
  }

  return {
    id: sessionData.userId,
    roles: []
  };
};

const resolvers = (routes: ExpressRouteType[]) => {
  routes.forEach((route) => {
    router[route.method.toLowerCase() as "get"](route.path, async (req: Request, res: Response, next: NextFunction) => {
      let viewer: Viewer | undefined = undefined;
      console.log(route);
      try {
        viewer = await getViewer(req);
      } catch (e) {
        console.log(46, e);
        if (route.security?.includes("bearerAuth")) {
          const errorData = await apiResolvers._401(
            {},
            {},
            {
              req,
              res,
              statusSet: false,
              setResponseStatus: (status: number) => {
                res.status(status);
              }
            }
          );
          res.json(errorData);
          return;
        }
      }
      const context: ContextType = {
        req,
        res,
        viewer,
        resolvers: apiResolvers,
        statusSet: false,
        setResponseStatus: (status: number) => {
          if (!context.statusSet) {
            context.statusSet = true;
            res.status(status);
          }
        },
        responseHeaders: { Authorization: req.headers?.Authorization as string }
      };
      try {
        const params = req.params;
        const query = req.query;
        const result = await route.resolver(
          {
            ...params,
            ...query
          },
          req.body,
          context
        );
        console.log(68, context.statusSet);
        context.setResponseStatus(200);
        Object.keys(context.responseHeaders).forEach((key) => {
          if (context.responseHeaders[key]) {
            res.setHeader(key, context.responseHeaders[key]);
          }
        });
        res.json(result);
        return;
      } catch (e: any) {
        console.trace(e);
        const errorData = await apiResolvers._500({ message: e?.message }, {}, context);
        res.json(errorData);
      }
    });
  });
  return router;
};

export default resolvers;
