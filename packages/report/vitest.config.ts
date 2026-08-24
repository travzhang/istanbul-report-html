import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: [
        "json",
        [
          path.resolve(__dirname, "./dist/index.cjs"),
          {
          },
        ],
      ],
    },
  },
});
