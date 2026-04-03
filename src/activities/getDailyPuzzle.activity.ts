import { createServerFn } from "@tanstack/react-start";
import { appMiddleware } from "../lib/serverFn";

export const getDailyPuzzle = createServerFn({ method: "GET" })
  .middleware(appMiddleware)
  .handler(async ({ context }) => {
    const today = new Date();
    return context.puzzleService.getPuzzleByDate(today);
  });
