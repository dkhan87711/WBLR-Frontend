import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/bhuManchitra/',
  plugins: [react()],
  server: {
    proxy: {
      '/geoserver': {
        target: 'http://indcs0152.atrapa.deloitte.com:8085/geoserver/AMC/wms',
        changeOrigin: true,
        secure: false
      },
      "/gisportal": {
        target:
          "https://indcs0152.atrapa.deloitte.com",
        changeOrigin: true,
        secure: false
      }
    },
     
  },
})



