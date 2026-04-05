/**
 * Base ESLint rules (non-TypeScript) for all packages
 */
export const baseRules = {
  "indent": ["error", 2],
  "semi": ["error", "never"],
}

/**
 * TypeScript-specific ESLint rules (require @typescript-eslint plugin)
 */
export const typescriptRules = {
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    },
  ],
}

/**
 * Base ESLint configuration for all packages
 * @type {import("eslint").Linter.Config[]}
 */
export const baseConfig = [
  {
    rules: {
      ...baseRules,
    },
  },
]

export default baseConfig
