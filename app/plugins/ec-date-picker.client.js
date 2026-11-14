// plugins/ec-date-picker.client.js
// Registers the <ec-date-picker> custom element once, browser-side only.
// The README says to import the package once in the browser; this plugin
// does  that. 
import '@hohte/ec-date-picker'

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // 强制触发一次，确保模块执行
    console.log('ec-date-picker registered?', !!customElements.get('ec-date-picker'))
  }
})