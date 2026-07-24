import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

/**
 * TanStack Start + Vite, targeting Vercel's Build Output API.
 *
 * Composes the plugins directly rather than through a wrapper package, so the
 * whole build is standard, inspectable TanStack Start config with no
 * third-party indirection. VITE_* variables are read from the environment by
 * Vite's native import.meta.env, so VITE_API_BASE_URL is picked up on Vercel.
 */
export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Route TanStack Start's server entry to src/server.ts, our SSR wrapper.
      server: { entry: "server" },
      // Keep server-only modules out of the client bundle.
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    nitro({
      preset: "vercel",
      output: {
        dir: ".vercel/output",
        serverDir: ".vercel/output/functions/__server.func",
        publicDir: ".vercel/output/static",
      },
    }),
    viteReact(),
  ],
});
