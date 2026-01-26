// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    // '@nuxtjs/cloudinary'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  // cloudinary: {
  //   cloudName: 'dveki8qer'
  // },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001/api'
    }
  },
  devtools: { enabled: true },
  srcDir: 'app'
})
