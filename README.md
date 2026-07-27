# Jacky

Nutrición y salud casera accesible para tu mascota. PWA construida con React + Vite + TypeScript + Tailwind, motor nutricional en `/src/engine` como módulo puro y testeado, almacenamiento local con Dexie (IndexedDB).

## Desarrollo

```bash
npm install
npm run dev
```

## Pruebas del motor nutricional

```bash
npm run test:run
```

## Build

```bash
npm run build
```

## Despliegue a GitHub Pages

El workflow `.github/workflows/deploy.yml` construye y publica `dist/` a GitHub Pages en cada push a `main`.

Para activarlo la primera vez: en el repositorio, ir a **Settings → Pages → Build and deployment → Source** y seleccionar **GitHub Actions**.

La app queda publicada en `https://<usuario>.github.io/jacky/` (el `base` en `vite.config.ts` está configurado como `/jacky/`; si el repo tiene otro nombre, ajusta ese valor).

## Estructura

- `src/engine`: motor nutricional puro (energía, porciones, costos, receta, riesgo, escalera de decisión). Sin dependencias de UI.
- `src/storage`: Dexie (IndexedDB) para el perfil, salud, peso y planes de alimentación.
- `src/ui`: pantallas del asistente de 3 pasos, resultado y seguimiento de peso.

## Alcance actual (MVP v1)

- Perfil de mascota + clasificación de riesgo verde/amarillo/rojo.
- Motor nutricional y escalera de decisión (rutas A/B/C/D).
- Receta casera con calcio y suplemento siempre marcados como clave.
- Recomendación comercial con checklist de etiqueta (WSAVA).
- Comparación de costos mensuales.
- Registro de peso con gráfica y reajuste de porción.
- Todo el almacenamiento es local (sin backend, sin cuenta).

No incluido aún: historial de salud/recordatorios, exportación a PDF, modo cocina, multi-mascota, configuración B2B (ver secciones 10 y 14 del documento de producto).
