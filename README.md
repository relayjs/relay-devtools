# Relay DevTools

**NOTE:** The Relay DevTools were started as a clone from the React DevTools. There is still code in here that hasn't been updated yet and should be either updated or removed.

## Installation

### Chrome

From the Chrome Web Store: [here](https://chrome.google.com/webstore/detail/relay-developer-tools/ncedobpgnmkhcmnnkcimnobpfepidadl).

### Firefox

We haven't tested and released the Firefox extension yet. [Issue #39](https://github.com/relayjs/relay-devtools/issues/39) tracks this.

### From Source

```sh
git clone git@github.com:relayjs/relay-devtools.git

cd relay-devtools

yarn install

yarn build:extension:chrome # builds at "shells/browser/chrome/build"
yarn build:extension:firefox # builds at "shells/browser/firefox/build"
```

## Support

As this extension is in a beta period, it is not officially supported. However if you find a bug, we'd appreciate you reporting it as a [GitHub issue](https://github.com/relayjs/relay-devtools/issues) with repro instructions.

## License

Relay DevTools are [MIT licensed](./LICENSE).
