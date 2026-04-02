export function makeDataService() {
  return {
    readData() {
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
