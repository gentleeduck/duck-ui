import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "unenv";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import { compression } from "vite-plugin-compression2";
import imagemin from "unplugin-imagemin/vite";
import contentCollections from "@content-collections/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
	plugins: [
		svgr(),
		tailwindcss(),
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		imagemin(),
		compression({
			algorithm: "brotliCompress",
		}),
		contentCollections(),
		,
		tanstackStart(),
	],
});
