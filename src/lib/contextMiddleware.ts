import { createMiddleware } from "@tanstack/react-start";
import { makeDataService } from "../services/data.service";

export const contextMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  // Leaf layers (repos, clients) will be wired here once added.
  // e.g. const db = drizzle(env.DB)

  // Services
  const dataService = makeDataService();

  return next({
    context: { dataService },
  });
});
