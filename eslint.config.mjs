import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // catches the dead imports/exports that accumulate as modules get moved around
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "none", varsIgnorePattern: "^_" },
      ],
    },
  },
]
