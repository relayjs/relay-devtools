# Relay Dev Tools Chrome Plugin

The Chrome Plugin is built using WebPack. To run the build:

```sh
yarn build:chrome
```

To incrementally build when files change:

```sh
yarn build:chrome -- --watch
```

To test the local version of the Chrome Plugin in your browser:

```sh
yarn start:chrome
```

To update the Chrome Plugin to refect changes you've made, reload it from the
"Manage Extensions" screen in Chrome.
