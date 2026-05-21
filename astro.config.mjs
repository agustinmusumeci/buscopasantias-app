// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
// import node from "@astrojs/node";
import clerk from "@clerk/astro";
import { esMX } from "@clerk/localizations";
import react from "@astrojs/react";
import { dark } from "@clerk/ui/themes";

// https://astro.build/config
export default defineConfig({
  site: "https://buscopasantias.com.ar",
  vite: {
    plugins: [tailwindcss()],
  },

  output: "server",
  prefetch: true,

  integrations: [
    clerk({
      localization: esMX,
      appearance: { theme: dark },
    }),
    react(),
    sitemap({
      filter: (page) => page === "https://buscopasantias.com.ar/" || page === "https://buscopasantias.com.ar/acerca/" || page === "https://buscopasantias.com/terminos-y-condiciones/",
    }),
  ],
  adapter: vercel(),
});
