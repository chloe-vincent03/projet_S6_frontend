// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'static'
  },
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
      // Si NUXT_PUBLIC_API_BASE n'est pas défini, il utilisera l'URL locale
      // Sur Vercel, tu mettras : https://projet-s6-api.onrender.com
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
    }
  },
  devtools: { enabled: true },
  srcDir: 'app'
})
