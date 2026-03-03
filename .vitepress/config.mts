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
              { text: 'Herramientas', link: '/tools' }
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
              { text: 'Tools', link: '/en/tools' }
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
