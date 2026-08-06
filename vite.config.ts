import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Keep this exactly in sync with the GitHub repository name.
const REPO_NAME = 'fitplate'

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [react()],
})
