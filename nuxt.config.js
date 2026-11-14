export default defineNuxtConfig({
  compatibilityDate: '2026-10-07',
  devtools: { enabled: true },
  css: [
    "~/assets/css/main.css",
    "@vuepic/vue-datepicker/dist/main.css"
  ],
  plugins: [
    "~/plugins/language.client.js"
  ],
  build: {
    transpile: ['@vuepic/vue-datepicker']
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'ec-date-picker',
    },
  },
  app: {
    head: {
      title: "HOHTE Portal",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
        { charset: "utf-8" },
      ],
      script: [
        { src: "https://telegram.org/js/telegram-web-app.js" },
        { src: "https://cdn.jsdelivr.net/gh/Hohite-Birihan-Sunday-School/ec-date-picker@v1.0.1/dist/ec-date-picker.js" }
      ],
    },
  },
  routeRules: {
    "/home/**": { ssr: false },
    "/**": { ssr: false },
  },
});