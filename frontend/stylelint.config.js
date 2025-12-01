export default {
  extends: ["@stylistic/stylelint-config"],
  customSyntax: "postcss-scss",
  plugins: ["stylelint-prettier"],
  rules: {
    "prettier/prettier": true
  }
};