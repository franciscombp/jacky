import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function mostrarErrorVisible(titulo: string, detalle: string) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div style="font-family: system-ui, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; color: #1c2620;">
      <h1 style="color:#b3402f; font-size: 20px;">Jacky no pudo cargar</h1>
      <p style="font-size: 14px; margin-top: 8px;"><strong>${titulo}</strong></p>
      <pre style="white-space: pre-wrap; font-size: 12px; background:#fdf6e8; padding: 12px; border-radius: 8px; overflow-x: auto;">${detalle}</pre>
    </div>
  `
}

window.addEventListener('error', (e) => {
  mostrarErrorVisible('Error de script', `${e.message}\n${e.filename}:${e.lineno}:${e.colno}`)
})
window.addEventListener('unhandledrejection', (e) => {
  mostrarErrorVisible('Promesa rechazada sin manejar', String(e.reason?.stack ?? e.reason))
})

try {
  const contenedor = document.getElementById('root')
  if (!contenedor) throw new Error('No se encontró el elemento #root en el HTML.')

  createRoot(contenedor).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  mostrarErrorVisible(
    'Falló al montar la aplicación',
    err instanceof Error ? `${err.message}\n${err.stack}` : String(err)
  )
}
