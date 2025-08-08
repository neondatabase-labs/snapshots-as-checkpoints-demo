import {
  updateDatabaseV1,
  updateDatabaseV2,
  updateDatabaseV3,
} from "./contacts";

const demo = [
  {
    id: "cp1",
    prompt: "Create me a simple contact book app",
    mutation: updateDatabaseV1,
    version: "v1",
  },
  {
    id: "cp2",
    prompt: "Add role and company fields",
    mutation: updateDatabaseV2,
    version: "v2",
  },
  {
    id: "cp3",
    prompt: "Add ability to add tags to contacts",
    mutation: updateDatabaseV3,
    version: "v3",
  },
] as const;

export default demo;
