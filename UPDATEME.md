# Guía de actualización y extensión

Este documento describe cómo agregar escenarios, imágenes y nuevas capacidades sin
acoplar la lógica de simulación a la interfaz.

## Arquitectura actual

El flujo principal está dividido en estas capas:

1. `server/scenarios.ts` carga el catálogo inicial mediante `loadScenarios()`.
2. `server/types.ts` define los contratos de escenarios y del estado simulado.
3. `server/simulator.ts` ejecuta las etapas, actualiza el estado cada segundo y
   conserva el historial.
4. `server/routes.ts` expone el catálogo, el progreso y el inicio de escenarios.
5. `src/App.vue` consulta periódicamente el estado del servidor.
6. `src/components/ScenarioPanel.vue` muestra los escenarios, el progreso y las
   imágenes.
7. `src/types.ts` mantiene los tipos equivalentes para Vue.

El servidor es la fuente de verdad de la ejecución. La interfaz no calcula los
valores del escenario: solo inicia la ejecución y visualiza el estado recibido.

## Agregar un escenario

Los escenarios actuales se agregan dentro del array que devuelve
`loadScenarios()` en `server/scenarios.ts`.

Ejemplo:

```ts
{
  id: 'respiracion',
  name: 'Respiración',
  description: 'Reduce gradualmente el pulso mediante una respiración guiada.',
  durationSeconds: 15,
  stages: [
    {
      durationSeconds: 5,
      values: {
        pulse: { minimum: 80, maximum: 90 },
        noiseLevel: { minimum: 0, maximum: 10 }
      }
    },
    {
      durationSeconds: 10,
      values: {
        pulse: { minimum: 65, maximum: 80 },
        noiseLevel: { minimum: 0, maximum: 0 }
      }
    }
  ],
  finalValues: {
    pulse: 70,
    noiseLevel: 0
  },
  sequenceImages: []
}
```

### Reglas importantes

- `id` debe ser único y estable. Se utiliza en la URL
  `/api/scenarios/:id/start`.
- `durationSeconds` debe ser igual a la suma de las duraciones de `stages`.
- Cada etapa representa un intervalo consecutivo.
- En cada segundo se genera un valor aleatorio dentro de cada rango definido.
- Si una etapa no define un valor, ese valor conserva el estado anterior.
- `finalValues` define el resultado exacto que queda al terminar.
- Los valores aceptados actualmente son:
  - `noiseLevel`: ruido ambiente.
  - `pulse`: pulso en BPM.

Si se agrega un nuevo valor simulado, hay que actualizar todos los puntos indicados
en [Agregar un nuevo valor simulado](#agregar-un-nuevo-valor-simulado).

## Agregar imágenes

Cada escenario tiene dos propiedades opcionales:

```ts
previewImage: '/scenarios/respiracion/preview.webp',
sequenceImages: [
  '/scenarios/respiracion/step-01.webp',
  '/scenarios/respiracion/step-02.webp',
  '/scenarios/respiracion/step-03.webp'
]
```

### Ubicación recomendada

Para imágenes estáticas del cliente, crear una carpeta como:

```text
public/
└── scenarios/
    └── respiracion/
        ├── preview.webp
        ├── step-01.webp
        ├── step-02.webp
        └── step-03.webp
```

Vite sirve los archivos de `public/` desde la raíz, por lo que la ruta usada en el
escenario debe comenzar con `/scenarios/`.

### Vista previa

`previewImage` se muestra en la tarjeta del escenario. Si se omite, se muestra el
texto `Sin vista previa`.

### Secuencia

`sequenceImages` se reproduce en el mismo orden del array. Durante la ejecución,
`ScenarioPanel.vue` calcula la imagen correspondiente al progreso total. Para
mantener una secuencia consistente:

- cargar las imágenes en orden;
- utilizar nombres ordenables, por ejemplo `step-01.webp`;
- evitar rutas externas si la aplicación debe funcionar sin conexión;
- optimizar el tamaño de las imágenes para no ralentizar la carga.

Actualmente la secuencia se distribuye proporcionalmente sobre la duración total.
Una futura mejora puede permitir asociar cada imagen a una etapa o a un intervalo
específico.

## Agregar un nuevo valor simulado

Por ejemplo, para agregar `temperature`:

1. Agregar el valor a `ScenarioValue` en `server/types.ts` y `src/types.ts`.
2. Agregarlo al modelo correspondiente de `BridgeState`.
3. Actualizar `initialState()` y `toPoint()` en `server/simulator.ts`.
4. Actualizar la lógica que aplica valores en `applyScenarioSecond()` y
   `applyFinalValues()`.
5. Agregarlo al componente de visualización o edición correspondiente.
6. Agregarlo a `HistoryChart.vue` si debe visualizarse históricamente.
7. Actualizar el esquema y los ejemplos de `server/openapi.ts`.
8. Agregar pruebas para el valor inicial, la ejecución y el valor final.

## Extender la API

Los endpoints públicos actuales son:

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/data` | Estado actual, incluyendo actividades |
| `PUT` | `/api/social-battery` | Actualización de la batería social |

La interfaz también utiliza `PUT /api/data` y endpoints internos para actualizar
el estado, cargar actividades, historial y escenarios. Esos endpoints no deben
agregarse a la documentación OpenAPI
pública.

Para agregar un endpoint:

1. Implementarlo en `server/routes.ts`.
2. Reutilizar métodos del simulador en lugar de duplicar estado.
3. Definir la respuesta y los errores esperados.
4. Documentarlo en `server/openapi.ts`.
5. Actualizar la tabla de API del `README.md`.

## Extender la interfaz

- `src/App.vue`: coordinación de consultas, estado global y acciones.
- `src/components/ScenarioPanel.vue`: catálogo, selección, progreso e imágenes.
- `src/components/ActivityPanel.vue`: selección de una actividad principal.
- `src/components/CellphonePanel.vue`: datos del teléfono y ruido.
- `src/components/SensorPanel.vue`: pulso.
- `src/components/HistoryChart.vue`: historial gráfico.
- `src/style.css`: variables y estilos compartidos.

Si la nueva funcionalidad tiene una responsabilidad visual independiente, crear un
componente nuevo en lugar de aumentar `App.vue`.

## Validación antes de publicar

Ejecutar:

```bash
pnpm run build
pnpm run test
```

Para probar manualmente el catálogo y el inicio:

```bash
curl http://localhost:5173/api/scenarios
curl http://localhost:5173/api/scenario-status
curl -X POST http://localhost:5173/api/scenarios/desregulacion/start
```

También se puede revisar la documentación interactiva en
`http://localhost:5173/api-docs/`.

## Posibles pasos futuros

### Persistencia y administración

- Guardar escenarios en JSON, base de datos o un CMS en lugar de mantenerlos en
  código.
- Crear endpoints CRUD para crear, editar, duplicar y eliminar escenarios.
- Validar escenarios al cargarlos: IDs duplicados, duraciones inválidas, rangos
  invertidos y suma incorrecta de etapas.
- Permitir importar y exportar escenarios.

### Motor de simulación

- Asociar valores a cada etapa con interpolación controlada en lugar de valores
  aleatorios independientes.
- Permitir pausarlo, reanudarlo, cancelarlo y reiniciarlo.
- Exponer el estado `completed` junto con `running`.
- Hacer configurable el intervalo de simulación para pruebas aceleradas.
- Separar el reloj en una abstracción testeable y evitar depender directamente de
  `Date.now()` en las pruebas.

### Imágenes y contenido multimedia

- Asociar imágenes a etapas o rangos de tiempo explícitos.
- Precargar la siguiente imagen para evitar parpadeos.
- Añadir audio, video o instrucciones de respiración.
- Incorporar accesibilidad: texto alternativo editable y subtítulos.
- Servir recursos desde un CDN cuando crezca el catálogo.

### Experiencia de usuario

- Mostrar el nombre de la etapa activa y los valores objetivo.
- Permitir elegir la duración o velocidad de reproducción.
- Añadir confirmación antes de reemplazar un escenario en ejecución.
- Mostrar errores de API en la interfaz, además de registrarlos en consola.
- Agregar una vista de detalle con la línea temporal completa.

### Calidad y operación

- Añadir pruebas unitarias para `loadScenarios()` y `Simulator`.
- Añadir pruebas de integración para las rutas de escenarios.
- Añadir pruebas de componentes para el panel y la secuencia de imágenes.
- Incorporar validación automática del contrato cliente-servidor.
- Añadir métricas y logs estructurados para ejecuciones.
- Configurar CI para ejecutar build, lint y tests en cada cambio.

## Checklist para una nueva actualización

- [ ] Actualizar tipos del servidor y del cliente si cambia el contrato.
- [ ] Agregar o modificar la carga del escenario en `server/scenarios.ts`.
- [ ] Verificar la suma de duraciones y los valores finales.
- [ ] Agregar y optimizar imágenes en `public/` si corresponde.
- [ ] Actualizar `server/openapi.ts`.
- [ ] Actualizar `README.md` y esta guía si cambia el flujo de extensión.
- [ ] Ejecutar `pnpm run build`.
- [ ] Ejecutar `pnpm run test`.
- [ ] Probar la API y la interfaz con el escenario nuevo.
