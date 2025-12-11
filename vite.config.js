import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
      host: '0.0.0.0', // Obligatorio para entornos cloud/contenedores
      port: 5173,
      strictPort: true, // Si el puerto 5173 está ocupado, fallará en lugar de cambiarlo (ayuda a depurar)
      allowedHosts: true // Permitir cualquier host (necesario para túneles de Manus/Replit)
    }
  }
})