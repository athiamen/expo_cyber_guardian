module.exports = [
  {
    ignores: [
      "node_modules/**",
      "babel.config.js",
      "eslint.config.cjs",
      "components/**/__tests__/**",
      ".expo/**",
    ],
  },
  {
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
        extraFileExtensions: [".ts", ".tsx"],
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      // Add any project-specific rule overrides here
    },
  },
];
