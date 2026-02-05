import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "RETARD_OS",
  description: "Documentation for the intellectually superior.",
  appearance: 'dark', // Paksa Mode Gelap
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#ff0000' }]
  ],

  themeConfig: {
    // Logo text di pojok kiri atas
    siteTitle: '>> RETARD_TERMINAL_',
    
    // Menu Navigasi di Atas
    nav: [
      { text: 'INITIATE', link: '/protocol/start' },
      { text: 'IQ_CHECK', link: '/protocol/iq-check' },
      { text: 'PUZZLES', link: '/protocol/cicada' }
    ],

    // Sidebar Menu (Kiri - Navigasi Utama)
    sidebar: [
      {
        text: 'SYSTEM_CORE',
        items: [
          { text: 'Manifesto', link: '/protocol/manifesto' },
          { text: 'Installation', link: '/protocol/start' },
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
      },
      {
        text: 'CICADA_3301',
        items: [
          { text: 'Epstein_Puzzle', link: '/protocol/epstein' },
          { text: 'Hidden_Truth', link: '/protocol/truth' }
        ]
      }
    ],

    // Link Sosmed
    socialLinks: [
      { icon: 'x', link: 'https://x.com/sanukek' },
      { icon: 'github', link: 'https://github.com/retard-exe/retard' }
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-PRESENT RETARD CORP.'
    },

    // Search Bar
    search: {
      provider: 'local'
    }
  }
})