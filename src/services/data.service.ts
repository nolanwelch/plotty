import type { DataResponse } from "../models/data.models";

export function makeDataService() {
  return {
    readData(): DataResponse {
      return {
        message: "Hello from Plotty",
        items: [
          { id: 1, name: "Alpha" },
          { id: 2, name: "Beta" },
          { id: 3, name: "Gamma" },
        ],
      };
    },
  };
}

export type DataService = ReturnType<typeof makeDataService>;
