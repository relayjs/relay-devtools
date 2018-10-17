// import { installToast } from 'src/backend/toast'
// import { isFirefox } from 'src/devtools/env'

window.addEventListener('message', e => {
  if (e.source === window && e.data.relayDetected) {
    chrome.runtime.sendMessage({message: e.data})
  }
})

function detect (win) {
  setTimeout(() => {
    // Method 1: Check Relay
    const relayDetected = Boolean(window.__RELAY_DEVTOOLS_HOOK__)

    if (relayDetected) {
      let Relay

      // if (window.$nuxt) {
      //   Vue = window.$nuxt.$root.constructor
      // }

      win.postMessage({
        devtoolsEnabled: true,

        relayDetected: true
      }, '*')

      return
    }

    // Method 2: Scan all elements inside document
    // const all = document.querySelectorAll('*')
    // let el
    // for (let i = 0; i < all.length; i++) {
    //   if (all[i].__vue__) {
    //     el = all[i]
    //     break
    //   }
    // }
    // if (el) {
    //   let Vue = Object.getPrototypeOf(el.__vue__).constructor
    //   while (Vue.super) {
    //     Vue = Vue.super
    //   }
    //   win.postMessage({
    //     devtoolsEnabled: Vue.config.devtools,
    //     vueDetected: true
    //   }, '*')
    // }
  }, 100)
}

// inject the hook
if (document instanceof HTMLDocument) {
  installScript(detect)
  // installScript(installToast)
}

function installScript (fn) {
  const source = ';(' + fn.toString() + ')(window)'

  // if (isFirefox) {
    // eslint-disable-next-line no-eval
    // window.eval(source) // in Firefox, this evaluates on the content window
  // } else {
    const script = document.createElement('script')
    script.textContent = source
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
  }
// }
