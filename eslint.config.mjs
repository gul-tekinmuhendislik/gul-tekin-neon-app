import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/coverage/**",
      "**/__tests__/**",
      "**/__mocks__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/jest.config.js",
      "**/jest.setup.js",
      "**/scripts/**",
      "**/.github/**"
    ]
  },
  {
    rules: {
      // Pre-existing: Turkish content often uses apostrophes (') which triggers this rule
      "react/no-unescaped-entities": "off",
      // Pre-existing: many components use destructured params without explicit typing
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Pre-existing: many API routes use catch blocks with `any`
      "@typescript-eslint/no-explicit-any": "warn",
    }
  }
];

export default eslintConfig;
