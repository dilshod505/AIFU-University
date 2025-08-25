import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/jsx-key": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/no-unstable-nested-components": "off",
      "react/jsx-no-duplicate-props": "off",
      "react/jsx-no-undef": "off",
      "react/jsx-no-lambda": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@next/next/no-sync-scripts": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
];

export default eslintConfig;
