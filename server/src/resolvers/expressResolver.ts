/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, no-console, @typescript-eslint/explicit-function-return-type */
import { NextFunction, Request, Response, Router } from "express";

import { apiResolvers, IUserRoles } from "@/_generated/sessionOperations";
import knex from "@/knexWrapper";
import { ContextType, LocalResolverType, Viewer } from "@/resolvers/expressTypeResolver";
import { tokenContext } from "@/utils/JWT";

const router = Router();

export type ExpressRouteType<ARGS extends Record<string, any> = any, RET extends Record<string, any> = any> = {
  path: `/${string}`;
  method: "get" | "post" | "put" | "delete";
  resolver: LocalResolverType<ARGS, RET>;
  security?: string[];
};

const getViewer = async (request: Request) => {
  const session = request.headers?.authorization || (request.headers?.Authorization as string);
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
    router[route.method.toLowerCase() as "get"](
      route.path,
      async (request: Request, response: Response, _next: NextFunction) => {
        let viewer: Viewer | undefined = undefined;
        console.log(route);
        try {
          viewer = await getViewer(request);
        } catch (error) {
          console.log(46, error);
          if (route.security?.includes("bearerAuth")) {
            const errorData = await apiResolvers._401(
              {},
              {},
              {
                req: request,
                res: response,
                statusSet: false,
                setResponseStatus: (status: number) => {
                  response.status(status);
                }
              }
            );
            response.json(errorData);
            return;
          }
        }
        const context: ContextType = {
          req: request,
          res: response,
          viewer,
          resolvers: apiResolvers,
          statusSet: false,
          setResponseStatus: (status: number) => {
            if (!context.statusSet) {
              context.statusSet = true;
              response.status(status);
            }
          },
          responseHeaders: { Authorization: request.headers?.Authorization as string }
        };
        try {
          const params = request.params;
          const query = request.query;
          const result = await route.resolver(
            {
              ...params,
              ...query
            },
            request.body,
            context
          );
          console.log(68, context.statusSet);
          context.setResponseStatus(200);
          Object.keys(context.responseHeaders).forEach((key) => {
            if (context.responseHeaders[key]) {
              response.setHeader(key, context.responseHeaders[key]);
            }
          });
          response.json(result);
          return;
        } catch (error: any) {
          console.trace(error);
          const errorData = await apiResolvers._500({ message: error?.message }, {}, context);
          response.json(errorData);
        }
      }
    );
  });
  return router;
};

export default resolvers;
