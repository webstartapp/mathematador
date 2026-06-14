const eslintJS = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const unusedImports = require("eslint-plugin-unused-imports");
const globals = require("globals");
const prettierConfig = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const reactNativePlugin = require("eslint-plugin-react-native");

const baseRestrictedSyntax = [
  {
    selector:
      "ExportDefaultDeclaration[declaration.type='FunctionDeclaration'], ExportDefaultDeclaration[declaration.type='ClassDeclaration']",
    message:
      "Do not export default declarations. Assign to a variable first: `const Name = ...; export default Name;`",
  },
  {
    selector: "ImportExpression",
    message:
      "Dynamic imports (import()) are not allowed. Use static imports instead.",
  },
  {
    selector:
      "MemberExpression[object.name='document'][property.name='cookie']",
    message:
      "Direct document.cookie access is forbidden. Use a standardized cookie helper instead.",
  },
  {
    selector: "TSTypePredicate",
    message:
      "The `is` type predicate is forbidden as it bypasses strict type checking, similar to `as`.",
  },
  {
    selector: "TSUnknownKeyword",
    message:
      "The `unknown` keyword is strictly forbidden. Use properly defined interfaces or specific types instead.",
  },
  {
    selector: "ImportDeclaration[source.value='react'] ImportDefaultSpecifier",
    message:
      "Import named exports (e.g. { useState }) from React instead of the default export.",
  },
  {
    selector: "MemberExpression[object.name='window']",
    message:
      "Using window is forbidden. Use a custom modal or specialized UI component instead.",
  },
];

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
      "**/_generated/**",
    ],
  },

  // Base JS Configuration
  {
    ...eslintJS.configs.recommended,
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs"],
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
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../**", "./**"],
              message:
                "Use aliases (e.g. @/ or @api/) instead of relative imports.",
            },
          ],
        },
      ],
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
      "no-constant-binary-expression": "error",
      "no-undef": "error",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      eqeqeq: ["error", "always"],
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "max-len": ["error", { code: 120 }],
      "id-length": [
        "error",
        {
          min: 4,
          exceptions: [
            "id",
            "row",
            "zod",
            "css",
            "cwd",
            "fs",
            "up",
            "down",
            "xml",
            "key",
            "jwt",
          ],
          properties: "never",
        },
      ],
    },
  },

  {
    files: ["**/eslint.config.js", "**/next.config.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  // TypeScript Files Configuration (Strict)
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      "unused-imports": unusedImports,
      prettier: prettierPlugin,
    },
    rules: {
      "max-lines": [
        "error",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["error", 10],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],
      "consistent-return": "error",
      "no-else-return": "error",
      "no-console": "error",

      "import/no-cycle": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variableLike",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "never",
        },
      ],
      "func-style": ["error", "expression"],
      "import/no-anonymous-default-export": [
        "error",
        {
          allowArray: false,
          allowArrowFunction: false,
          allowAnonymousClass: false,
          allowAnonymousFunction: false,
          allowCallExpression: false,
          allowLiteral: false,
          allowObject: false,
        },
      ],
      "no-restricted-syntax": ["error", ...baseRestrictedSyntax],
      "id-length": [
        "error",
        {
          min: 4,
          exceptions: [
            "id",
            "row",
            "zod",
            "css",
            "cwd",
            "fs",
            "up",
            "down",
            "xml",
            "key",
            "jwt",
          ],
          properties: "never",
        },
      ],
    },
  },

  // Test Files Configuration (adds Jest globals)
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**/*.ts",
      "**/__tests__/**/*.tsx",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
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
      "react-hooks/exhaustive-deps": "error",
      "no-undef": "error",
    },
  },

  // JS Files Configuration (disable type-aware rules)
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Prettier Config integration to disable conflicting ESLint rules
  prettierConfig,
];
