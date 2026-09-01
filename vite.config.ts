import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))
const pagesBase = process.env.GITHUB_PAGES === 'true' ? '/image-gen/' : '/'

function spaFallback() {
  return {
    name: 'spa-github-pages-fallback',
    closeBundle() {
      const index = resolve(root, 'dist', 'index.html')
      if (existsSync(index)) copyFileSync(index, resolve(root, 'dist', '404.html'))
    },
  }
}

export default defineConfig({
  base: pagesBase,
  plugins: [vue(), spaFallback()],
})
