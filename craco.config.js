module.exports = {
  babel: {
    presets: [],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["babel-plugin-transform-class-properties", { loose: true }],
    ],
    loaderOptions: {
      /* Any babel-loader configuration options: https://github.com/babel/babel-loader. */
    },
  },
  plugins: [
    // { plugin: require("@jackwilsdon/craco-use-babelrc") },
    { plugin: require("@semantic-ui-react/craco-less") },
    // { plugin: require('@babel/plugin-proposal-decorators'), options: { "legacy": true } },
    // { plugin: require('@babel/plugin-proposal-class-properties'), options: { "lose": true } }
  ],
};
