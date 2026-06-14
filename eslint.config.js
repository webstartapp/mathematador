const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const unusedImports = require("eslint-plugin-unused-imports");
const globals = require("globals");
const prettierConfig = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const reactNativePlugin = require("eslint-plugin-react-native");

module.exports = [
  // Global Ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.expo/**",
      "mathematador-app/web-build/**",
      "agents/**",
      "**/build/**",
      "server/build/**",
    ],
  },

  // Base configuration for all files
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      prettier: prettierPlugin,
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    rules: {
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
      "no-constant-binary-expression": "error",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      eqeqeq: ["error", "always"],
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // TypeScript Files Configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off", // Allowed to support generator compatibility stubs
      "@typescript-eslint/no-require-imports": "warn",
    },
  },

  // React Native App Configuration
  {
    files: ["mathematador-app/src/**/*.ts", "mathematador-app/src/**/*.tsx"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-native": reactNativePlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Prettier Config integration to disable conflicting ESLint rules
  prettierConfig,
];
