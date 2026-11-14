import '@hohte/ec-date-picker'

export default defineNuxtPlugin(() => {
  window.__ecdpPluginRan = true
  window.__ecdpRegistered = !!customElements.get('ec-date-picker')
})