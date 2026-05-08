import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: prettier.rules },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "import/order": "off",
    },
  },
  // One-shot CLI scripts run via `tsx` from package.json — they're allowed
  // (and expected) to log progress to stdout.
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "public/**",
    "next-env.d.ts",
    ".vercel/**",
  ]),
]);

export default eslintConfig;
