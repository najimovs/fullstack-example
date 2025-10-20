import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig( {
	server: {
		host: true,
		port: 3001,
	},
	build: {
		target: "esnext",
		chunkSizeWarningLimit: 1024,
	},
	resolve: {
		alias: {
			"@app": path.resolve( __dirname, "./src/app" ),
			"@lib": path.resolve( __dirname, "./src/library" ),
		},
	},
	plugins: [
		react(),
	]
} )
