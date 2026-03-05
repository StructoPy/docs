import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
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
            { text: 'Desarrolladores', link: '/developer/tools' },
            { text: 'Módulos', link: '/modules/' }
          ],
          sidebar: {
            '/developer/': [
              {
                text: 'Guía de Desarrollo',
                items: [
                  { text: 'Herramientas', link: '/developer/tools' },
                  { text: 'Backend (.NET)', link: '/developer/backend' },
                  { text: 'Frontend (Nuxt)', link: '/developer/frontend' },
                  { text: 'Observabilidad', link: '/developer/observability' }
                ]
              }
            ],
            '/modules/': [
              {
                text: 'Módulos del Sistema',
                items: [
                  { text: 'Introducción', link: '/modules/' }
                ]
              }
            ]
          }
        }
      },
      en: {
        label: 'English',
        lang: 'en',
        link: '/en/',
        themeConfig: {
          nav: [
            { text: 'Home', link: '/en/' },
            { text: 'Developers', link: '/en/developer/tools' },
            { text: 'Modules', link: '/en/modules/' }
          ],
          sidebar: {
            '/en/developer/': [
              {
                text: 'Developer Guide',
                items: [
                  { text: 'Tools', link: '/en/developer/tools' },
                  { text: 'Backend (.NET)', link: '/en/developer/backend' },
                  { text: 'Frontend (Nuxt)', link: '/en/developer/frontend' },
                  { text: 'Observability', link: '/en/developer/observability' }
                ]
              }
            ],
            '/en/modules/': [
              {
                text: 'Software Modules',
                items: [
                  { text: 'Introduction', link: '/en/modules/' }
                ]
              }
            ]
          }
        }
      }
    },

    themeConfig: {
      socialLinks: [
        { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
      ]
    }
  })
)
