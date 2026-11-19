# GBV · Radar interactivo SECOP II

Sitio estático para el Laboratorio de Proyectos. Permite explorar 21 ofertas priorizadas y 9 procesos en vigilancia mediante búsqueda, filtros por sector y tipo de participación, ordenamiento y vistas compartibles por URL.

## Sitio publicado

- **Radar interactivo:** https://alarconmd.github.io/gbv-radar-secop-ii/
- **Documento ejecutivo:** https://alarconmd.github.io/gbv-radar-secop-ii/documento.html
- **PDF descargable:** https://alarconmd.github.io/gbv-radar-secop-ii/GBV_Radar_SECOP_II_Laboratorio_Proyectos_19NOV2026.pdf

## Datos y alcance

- Corte: **19 de noviembre de 2026, 06:32, hora de Colombia**.
- Fuente oficial: Colombia Compra Eficiente, dataset **SECOP II – Procesos de Contratación**, identificador `p6dx-8zbt`.
- La página es una fotografía del corte indicado; **no se actualiza automáticamente**.
- Los procesos marcados como “Vigilancia” están en presentación de observaciones y no son ofertas actualmente abiertas.
- Antes de ofertar se deben revisar los documentos vigentes, habilitación, experiencia, garantías y reglas de participación.

## Funcionalidades

- Búsqueda por entidad, referencia, ID, sector, objeto o análisis.
- Filtros por sector y por núcleo GBV, aliados o vigilancia.
- Orden por prioridad, cierre o presupuesto.
- URLs compartibles con los filtros aplicados.
- Tema claro/oscuro, detalles expandibles e impresión de la vista filtrada.
- Diseño adaptable a dispositivos móviles y navegación por teclado.

## Ejecución local

No requiere compilación ni dependencias. Desde esta carpeta:

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000`.

## Archivos

- `index.html`: interfaz principal.
- `web_styles.css`: estilos responsivos y temas.
- `app.js`: filtros, ordenamiento, tarjetas y navegación.
- `data.js`: datos estructurados del corte.
- `documento.html`: versión ejecutiva de 12 páginas.
- `GBV_Radar_SECOP_II_Laboratorio_Proyectos_19NOV2026.pdf`: entregable descargable.

El sitio no utiliza analítica, cookies de seguimiento, frameworks ni recursos externos de JavaScript o CSS. Su URL es pública; `robots.txt` y las etiquetas `noindex` reducen la indexación, pero no restringen el acceso.
