import { installHook } from 'src/hook';

// Inject a `__RELAY_DEVTOOLS_HOOK__` global so that Relay can detect that the
// devtools are installed (and skip its suggestion to install the devtools).
(function() {
  installHook(window);
  window.__RELAY_DEVTOOLS_HOOK__.on('environment', function(evt) {
    window.postMessage(
      {
        source: 'relay-devtools-detector',
      },
      '*'
    );
  });
})();
