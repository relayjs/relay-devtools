# Relay DevTools

Tooling to debug your Relay apps on web and React Native during development.

## Installation

For Google Chrome, install the [extension from WebStore][0].
After installation "Relay" tab will be available in the Chrome developer tools
apps using Relay are inspected.

For inspecting React Native apps using Relay, install a desktop Electron app:

```bash
npm install -g relay-devtools
relay-devtools
```

[0]: https://chrome.google.com/webstore/detail/relay-devtools/oppikflppfjfdpjimpdadhelffjpciba

## Usage

You can inspect the current state of Relay Store by viewing records from the
store and expanding their connections.

![Store Explorer](./images/store-explorer.png)

In addition to that, you can record all mutation events happenning to the store
and inspect how they changed the store.

![Mutaitons View](./images/mutations-view.png)

## Development

Start the webpack devserver to run the app against mock data.
Then navigate to `localhost:3000`.

```
yarn start
```

### Extension

Build a Chrome Extension build. The extension output will be placed to the
extension folder.

```
yarn build:extension
```

### Electron

Build an Electron App build. Compile the app into a single importable file and
then build the shell.
This app is distributed as `relay-devtools` on npm. [npmjs link][1].

[2]: https://www.npmjs.com/package/relay-devtools


```
yarn build:lib
cd react-native-shell
yarn start
```

### React Native runtime lib

Build a runtime that is required to debug apps running on React Native. This
runtime lib is imported by Relay in runtime. This lib is published as
`relay-debugger-react-native-runtime`. [npmjs.com link][2].

[2]: https://www.npmjs.com/package/relay-debugger-react-native-runtime

```
cd react-native-runtime
yarn build
```
