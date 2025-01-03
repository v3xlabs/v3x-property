const path = require("path");

module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2021,
    },
    extends: ["plugin:v3xlabs/recommended", "plugin:import/recommended"],
    ignorePatterns: ["!**/*", "src/**/*.gen.ts"],
    plugins: ["v3xlabs", "tailwindcss", "import"],
    env: {
        browser: true,
        node: true,
    },
    rules: {
        quotes: ["error", "single"],
        indent: ["error", 4],
        "sonarjs/cognitive-complexity": "off",
        "tailwindcss/classnames-order": ["error"],
        "prettier/prettier": ["off", { singleQuote: true, parser: "flow" }],
        "no-duplicate-imports": "error",
    },
    settings: {
        "import/resolver": {
            vite: {
                viteConfig: {
                    resolve: {
                        alias: {
                            "@": path.resolve(__dirname, "src"),
                        },
                    },
                },
            },
        },
    },
};
