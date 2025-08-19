const demo = [
  {
    id: "cp0",
    prompt: null,
    version: "v0",
  },
  {
    id: "cp1",
    prompt: "Create me a simple contact book app",
    version: "v1",
  },
  {
    id: "cp2",
    prompt: "Add role and company fields",
    version: "v2",
  },
  {
    id: "cp3",
    prompt: "Add ability to add tags to contacts",
    version: "v3",
  },
] as const;

export default demo;
export type DemoStep = (typeof demo)[number];
