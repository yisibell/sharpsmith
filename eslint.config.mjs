import eslint from "@eslint/js";
import format from "eslint-plugin-format";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,cjs,mjs,ts,cts,mts,tsx}"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      format,
    },
    rules: {
      "format/oxfmt": "error",
    },
  },
);
