import { z } from "zod";

export const DataItem = z.object({
  id: z.number(),
  name: z.string(),
});
export type DataItem = z.infer<typeof DataItem>;

export const DataResponse = z.object({
  message: z.string(),
  items: z.array(DataItem),
});
export type DataResponse = z.infer<typeof DataResponse>;
