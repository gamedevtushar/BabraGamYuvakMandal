import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
function serviceWorker() { return { name:'service-worker', apply:'build', generateBundle() {
  this.emitFile({type:'asset',fileName:'sw.js',source:fs.readFileSync('src/sw.js','utf8').replace("'__BUILD_ID__'", JSON.stringify(Date.now().toString(36)))})
} } }
export default defineConfig({ plugins:[react(),tailwindcss(),serviceWorker()], base:process.env.BASE_PATH || '/', build:{chunkSizeWarningLimit:1200}, server:{open:false} })
