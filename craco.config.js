module.exports = {
  plugins: [
    { plugin: require('@jackwilsdon/craco-use-babelrc') },
    { plugin: require('@semantic-ui-react/craco-less') },
    // { plugin: require('@babel/plugin-proposal-decorators'), options: { "legacy": true } },
    // { plugin: require('@babel/plugin-proposal-class-properties'), options: { "lose": true } }
  ],
}
