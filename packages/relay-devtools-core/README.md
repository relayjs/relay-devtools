# `relay-devtools-core`

A standalone Relay DevTools implementation.

This is a low-level package. If you're looking for the Electron app you can run, **use `relay-devtools` package instead.**

## API

### `relay-devtools-core`

This is similar requiring the `relay-devtools` package, but provides several configurable options. Unlike `relay-devtools`, requiring `relay-devtools-core` doesn't connect immediately but instead exports a function:

```js
const { connectToDevTools } = require('relay-devtools-core');
connectToDevTools({
  // Config options
});
```

Run `connectToDevTools()` in the same context as React to set up a connection to DevTools.  
Be sure to run this function _before_ importing e.g. `react`, `react-dom`, `react-native`.

The `options` object may contain:

- `host: string` (defaults to "localhost") - Websocket will connect to this host.
- `port: number` (defaults to `8097`) - Websocket will connect to this port.
- `websocket: Websocket` - Custom websocked to use. Overrides `host` and `port` settings if provided.
- `resolveNativeStyle: (style: number) => ?Object` - Used by the React Native style plug-in.
- `isAppActive: () => boolean` - If provided, DevTools will poll this method and wait until it returns true before connecting to React.

## `relay-devtools-core/standalone`

Renders the DevTools interface into a DOM node.

```js
require('relay-devtools-core/standalone')
  .setContentDOMNode(document.getElementById('container'))
  .setStatusListener(status => {
    // This callback is optional...
  })
  .startServer(port);
```

Reference the `relay-devtools` package for a complete integration example.
