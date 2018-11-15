# Relay DevTools

Tooling to debug your Relay apps on web and React Native during development.

## Installation

For Google Chrome, install the [extension from WebStore][0].
After installation "Relay" tab will be available in the Chrome developer tools
apps using Relay are inspected.

For inspecting Relay outside of Chrome, such as in Safari or React Native,
use the standalone Relay DevTools app.

```bash
npm install -g relay-devtools
```

Install Relay DevTools into your application somewhere before a Relay
Environment is created. Don't forget to remove DevTools when you release to
production!

```js
const {Environment} = require('relay-runtime');
const {installRelayDevTools} = require('relay-devtools');

installRelayDevTools();

new Environment(...);
```

Run the Relay DevTools standalone app from the terminal, and it will connect
to your running Relay application.

```bash
relay-devtools
```

[0]: https://chrome.google.com/webstore/detail/relay-devtools/oppikflppfjfdpjimpdadhelffjpciba

## Usage

You can inspect the current state of Relay Store by viewing records from the
store and expanding their connections.

![Store Explorer](./images/store-explorer-updated.png)

In addition to that, you can record all update events happenning to the store
and inspect how they changed the store.

![Updates View](./images/mutations-view-updated.png)

## Development

Start the webpack devserver to run the app against mock data.
Then navigate to `localhost:3000`.

```
yarn start
```

## Chrome Extension

See Integrations Chrome readme

## Electron

See Integrations standalone readme

```nice

```
