import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      title: "FrameLog",
      htmlAttrs: {
        lang: "en"
      },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/logo.svg" }
      ],
      charset: 'utf-16',
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1',
    }
  }
});