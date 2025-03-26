import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/option/index.ts", "src/result/index.ts", "src/utils/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: "dist",
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
});
