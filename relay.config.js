module.exports = {
  src: './shells/dev/relay-app',
  schema: './shells/dev/relay-app/schema.graphql',
  watchman: false,
  watch: false,
  exclude: ['**/node_modules/**', '**/__generated__/**'],
};
