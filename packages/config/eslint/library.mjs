import { defineConfig, globalIgnores } from "eslint/config"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import { baseRules, typescriptRules } from "./base.mjs"

/**
 * ESLint configuration for library packages
 * @type {import("eslint").Linter.Config[]}
 */
const libraryConfig = defineConfig([
  globalIgnores([
    "dist/**",
    "node_modules/**",
    "**/generated/**",
  ]),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...baseRules,
      ...typescriptRules,
    },
  },
])

export default libraryConfig
