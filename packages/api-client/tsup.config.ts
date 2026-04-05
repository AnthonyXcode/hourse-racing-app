import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  // Externalize Node.js packages to avoid bundling issues with Next.js Turbopack
  external: [
    "form-data",
    "combined-stream",
    "delayed-stream",
    "mime-types",
    "asynckit",
    "util",
    "stream",
    "fs",
    "path",
    "http",
    "https",
    "url",
    "zlib",
  ],
})
