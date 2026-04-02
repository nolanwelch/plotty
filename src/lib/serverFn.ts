// TanStack Start's Vite plugin requires createServerFn() to appear literally in
// source for its AST transform, so we can't wrap it in a factory. Instead, export
// middleware arrays that activities chain via .middleware().
import { contextMiddleware } from "./contextMiddleware";

export const appMiddleware = [contextMiddleware] as const;
