import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "RETARD_CLI",
  description: "Documentation for the intellectually superior.",
  appearance: 'dark', 
  lastUpdated: true,

  head: [
    // Favicon PNG (Simpan file logo.png di docs/public/)
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#ff0000' }]
  ],

  themeConfig: {
    // Logo dan Tautan
    logo: '/logo.png', 
    siteTitle: '>> RETARD DOCS',
    logoLink: '/protocol/manifesto',

    // Menu Navigasi Atas
    nav: [
      { text: 'RETARD.EXE', link: 'https://retard.social' },
      { text: 'IQ_CHECK', link: '/protocol/iq-check' },
      { text: 'PUZZLES', link: '/protocol/cicada' }
    ],

    // Sidebar Kiri
    sidebar: [
      {
        text: 'SYSTEM_CORE',
        items: [
          { text: 'Manifesto', link: '/protocol/manifesto' },
          { text: 'RETARD_CLI', link: '/protocol/start' },
          { text: 'Architecture', link: '/protocol/architecture' }
        ]
      },
      {
        text: 'INTELLIGENCE_MODULES',
        items: [
          { text: 'Biometric_Monitor', link: '/protocol/biometrics' },
          { text: 'Brain_Engine', link: '/protocol/brain' },
          { text: 'Stress_Level', link: '/protocol/stress' }
        ]
      }
    ],

    // Tautan Sosial
    socialLinks: [
      { icon: 'x', link: 'https://x.com/sanukek' },
      { icon: 'github', link: 'https://github.com/retard-exe/retard' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-PRESENT RETARD CORP.'
    },

    search: {
      provider: 'local'
    }
  }
})