import { createServerFn } from "@tanstack/react-start";
import { appMiddleware } from "../lib/serverFn";

export const readData = createServerFn({ method: "GET" })
  .middleware(appMiddleware)
  .handler(async ({ context }) => {
    return context.dataService.readData();
  });
