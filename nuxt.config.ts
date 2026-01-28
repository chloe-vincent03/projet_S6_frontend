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
  app: {
    head: {
      htmlAttrs: {
        lang: 'fr'
      },
      titleTemplate: '%s - La Ville Lente',
      title: 'La Ville Lente',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Redécouvrez votre ville à travers une exploration ludique et poétique. Trouvez les totems, résolvez les énigmes et collectionnez les souvenirs.' },
        { name: 'theme-color', content: '#2C3E50' },
        // Open Graph Default
        { property: 'og:site_name', content: 'La Ville Lente' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'fr_FR' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  devtools: { enabled: true },
  srcDir: 'app'
})
