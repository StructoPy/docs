import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Structo Docs",
  description: "Documentation for Structo",
  base: '/docs/',

  locales: {
    root: {
      label: 'Español',
      lang: 'es',
      themeConfig: {
        nav: [
          { text: 'Inicio', link: '/' },
          { text: 'Guía', link: '/tools' }
        ],
        sidebar: [
          {
            text: 'Introducción',
            items: [
              { text: 'Herramientas', link: '/tools' },
              { text: 'Backend (.NET)', link: '/backend' },
              { text: 'Frontend (Nuxt)', link: '/frontend' }
            ]
          }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/tools' }
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'Tools', link: '/en/tools' },
              { text: 'Backend (.NET)', link: '/en/backend' },
              { text: 'Frontend (Nuxt)', link: '/en/frontend' }
            ]
          }
        ]
      }
    }
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
