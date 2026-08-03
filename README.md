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
- `src/ui`: asistente de una pregunta por pantalla (estilo Airbnb), lista de mascotas, resultado y seguimiento de peso.

## Alcance actual (MVP v1)

- Multi-mascota: lista de mascotas guardadas, agregar y editar sin resetear todo.
- Asistente de una pregunta por pantalla: especie, nombre, edad, tamaño, castrado, actividad, peso (rueda de selección estilo picker iOS), contextura corporal (estilo BCS veterinario), banderas de salud, disposición a cocinar.
- Clasificación de riesgo verde/amarillo/rojo (incluye banderas implícitas por especie/etapa: gato, cachorro, senior).
- Motor nutricional y escalera de decisión (rutas A/B/C/D).
- Receta casera con calcio y suplemento siempre marcados como clave.
- Recomendación comercial con checklist de etiqueta (WSAVA).
- Sin pregunta de presupuesto: se muestra una recomendación general con un selector "gastar menos / equilibrado / gastar más", y se puede elegir manualmente cualquier alternativa como plan.
- Registro de peso con gráfica y reajuste de porción.
- Salud y recordatorios: vacunas, desparasitación, pulgas, medicación y control veterinario, con recurrencia y aviso de vencidos visible desde la lista de mascotas.
- Todo el almacenamiento es local (sin backend, sin cuenta).

No incluido aún: exportación a PDF, modo cocina, respaldo/traspaso de perfil (JSON), configuración B2B (ver secciones 10 y 14 del documento de producto).
