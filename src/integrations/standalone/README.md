Relay DevTools (Standalone)
---------------------------

The Relay DevTools requires use of Relay (`relay-runtime`) v1.4.0 or greater.

For inspecting Relay outside of Chrome, such as in Safari or React Native,
use the standalone Relay DevTools app.

```bash
npm install -g relay-devtools
```

Install Relay DevTools into your application somewhere before a Relay
Environment is created. Don't forget to remove DevTools when you release to
production!

```js
const {installRelayDevTools} = require('relay-devtools');
const {Environment} = require('relay-runtime');

installRelayDevTools();

new Environment(...);
```

Run the Relay DevTools standalone app from the terminal, and it will connect
to your running Relay application.

```bash
relay-devtools
```
