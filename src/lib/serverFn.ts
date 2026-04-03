import { contextMiddleware } from "./contextMiddleware";

export const appMiddleware = [contextMiddleware] as const;
