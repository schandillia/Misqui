import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import unusedImportsPlugin from "eslint-plugin-unused-imports"
import prettierPlugin from "eslint-plugin-prettier"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.{ts,tsx,cts}"],
    languageOptions: {
      parser: tsParser, // <--- imported parser object, not string
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "unused-imports/no-unused-imports": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "debug", "info"] }],
    },
  },

  {
    files: ["**/*.{js,mjs,ts,tsx,cts}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },
]
