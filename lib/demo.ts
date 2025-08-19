import {
  updateDatabaseV1,
  updateDatabaseV2,
  updateDatabaseV3,
} from "./contacts";

const demo = [
  {
    id: "cp0",
    prompt: "",
    // v0 performs no mutation; represents the empty app DB state
    mutation: async (_databaseUrl: string) => {},
    version: "v0",
  },
  {
    id: "cp1",
    prompt: "Create me a simple contact book app",
    mutation: (databaseUrl: string) => updateDatabaseV1(databaseUrl),
    version: "v1",
  },
  {
    id: "cp2",
    prompt: "Add role and company fields",
    mutation: (databaseUrl: string) => updateDatabaseV2(databaseUrl),
    version: "v2",
  },
  {
    id: "cp3",
    prompt: "Add ability to add tags to contacts",
    mutation: (databaseUrl: string) => updateDatabaseV3(databaseUrl),
    version: "v3",
  },
] as const;

export default demo;
export type DemoStep = (typeof demo)[number];
