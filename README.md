# Pulso Háptico Vue

Simulador de contexto que muestra datos de un teléfono, un sensor de pulso y la batería social, junto con el historial de mediciones. La interfaz Vue consulta el bridge cada segundo y permite ejecutar escenarios temporales de regulación y desregulación. El proyecto incluye una API Express, documentación Swagger y un túnel opcional con ngrok.

## Requisitos

- Node.js 20 o superior
- pnpm 12.4.2
- Docker y Docker Compose (opcional)

## Desarrollo local

```bash
pnpm install
pnpm run dev
```

La aplicacion queda disponible en `http://localhost:5173`.

Tambien se puede usar `make dev`. En este modo, Vite sirve la interfaz y el servidor Express se ejecuta por separado.

## Estructura del proyecto

La aplicacion esta dividida en una interfaz Vue y un servidor Express. Cada capa tiene una responsabilidad concreta para que los cambios puedan hacerse en el archivo adecuado.

### Archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| `package.json` | Dependencias y comandos de desarrollo, build, test y produccion. |
| `vite.config.ts` | Configuracion de Vite para la interfaz Vue. |
| `tsconfig.json` | Configuracion de TypeScript para el cliente. |
| `tsconfig.server.json` | Configuracion de TypeScript para compilar `server/` en `dist-server/`. |
| `index.html` | Documento HTML base donde Vue monta la aplicacion. |
| `Makefile` | Atajos para desarrollo, Docker, logs, estado y tunel ngrok. |
| `Dockerfile` | Imagen del servicio de la aplicacion. |
| `docker-compose.yml` | Servicios y redes usadas para levantar la aplicacion y servicios auxiliares. |
| `README.md` | Documentacion de uso, API y mantenimiento del proyecto. |
| `UPDATEME.md` | Guía para agregar escenarios, imágenes y extender la aplicación. |

### Cliente (`src/`)

| Archivo | Responsabilidad |
| --- | --- |
| `src/main.ts` | Punto de entrada de Vue; monta `App.vue` y carga los estilos globales. |
| `src/App.vue` | Coordina el estado de la pantalla, consulta la API y actualiza el simulador. |
| `src/types.ts` | Tipos compartidos por los componentes del cliente. Deben mantenerse alineados con `server/types.ts`. |
| `src/style.css` | Variables visuales, estilos globales y estilos reutilizables. |
| `src/components/CellphonePanel.vue` | Edicion y visualizacion del ruido y la fecha. |
| `src/components/SensorPanel.vue` | Edicion y visualizacion del pulso del sensor. |
| `src/components/HistoryChart.vue` | Grafico historico usando Chart.js. |
| `src/components/ScenarioPanel.vue` | Seleccion, ejecucion, progreso e imagenes de escenarios. |

### Servidor (`server/`)

| Archivo | Responsabilidad |
| --- | --- |
| `server/index.ts` | Punto de entrada del proceso Node. Crea la aplicacion y comienza a escuchar el puerto configurado. |
| `server/config.ts` | Carga variables de entorno y centraliza configuracion del servidor y ruta de `dist/`. |
| `server/app.ts` | Construye Express, registra CORS, JSON, rutas API y archivos estaticos. |
| `server/routes.ts` | Define endpoints de datos, historial, OpenAPI y Swagger UI. |
| `server/simulator.ts` | Mantiene el estado simulado y el historial de hasta 60 mediciones. |
| `server/scenarios.ts` | Función de carga inicial del catálogo de escenarios y sus etapas. |
| `server/types.ts` | Contratos de datos del servidor: estado del bridge y puntos historicos. |
| `server/openapi.ts` | Especificacion OpenAPI que alimenta `/openapi.json` y Swagger UI. |

El flujo de arranque del servidor es: `index.ts` crea la aplicación con `app.ts`; `app.ts` registra el router de `routes.ts`; las rutas consultan `simulator.ts`; el simulador carga el catálogo mediante `loadScenarios()` desde `scenarios.ts`; los contratos usados por el servidor viven en `types.ts`.

### Donde hacer cambios

- Para agregar o modificar un endpoint, edita `server/routes.ts` y actualiza `server/openapi.ts`.
- Para cambiar el estado inicial, el limite del historial o la logica de simulacion, edita `server/simulator.ts`.
- Para cambiar la forma de los datos, actualiza `server/types.ts` y `src/types.ts`, y revisa los componentes que los consumen.
- Para cambiar CORS, puerto o rutas de produccion, edita `server/config.ts`.
- Para cambiar la interfaz o sus consultas, edita `src/App.vue` o el componente correspondiente.
- Para cambiar colores y estilos compartidos, edita `src/style.css`; los estilos especificos permanecen en cada componente.
- Para agregar escenarios, imágenes o nuevas etapas, consulta [UPDATEME.md](./UPDATEME.md).

## Produccion local

```bash
pnpm run build
pnpm run start
```

## Docker

```bash
make up
```

Por defecto se publica en `http://localhost:5173`. Despues de levantar los servicios, las URLs principales son:

- Aplicacion: `http://localhost:5173`
- Swagger UI: `http://localhost:5173/api-docs/`
- Especificacion OpenAPI: `http://localhost:5173/openapi.json`
- Panel de inspeccion de ngrok: `http://localhost:4040`

Para cambiar los puertos, usa `APP_PORT` y `TUNNEL_PORT`:

```bash
APP_PORT=8080 TUNNEL_PORT=4041 make up
```

El servicio ngrok es opcional. Crea la configuracion local y reemplaza el token:

```bash
cp .env.example .env
make tunnel
```

El panel local de ngrok queda disponible en `http://localhost:4040`. El tunel publica el servicio `bridge` y requiere `NGROK_AUTHTOKEN` valido en `.env`.

## API

La API expone estos endpoints públicos para consumo desde otra aplicación:

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/api/data` | Obtiene el estado actual y el perfil seleccionado |
| `PUT` | `/api/data` | Modifica los datos del dispositivo, incluida la hora expuesta |
| `GET` | `/api/profiles` | Lista los perfiles de personas neurodivergentes |
| `PUT` | `/api/profile` | Selecciona un perfil y carga sus valores iniciales |
| `PUT` | `/api/social-battery` | Establece la batería social externa (0 a 100), sin simularla |

Los endpoints internos `/api/history`, `/api/scenarios`,
`/api/scenario-status` y `/api/scenarios/:id/start` son utilizados únicamente
por esta aplicación y no forman parte de la documentación pública OpenAPI.

Cada escenario se compone de etapas (`stages`). Cada etapa define su duracion y los
rangos minimo/maximo de los valores simulados para cada segundo. `finalValues`
define el estado exacto que queda al terminar. `previewImage` y `sequenceImages`
son opcionales y permiten agregar una vista previa y una secuencia de imagenes;
durante la ejecucion las imagenes de la secuencia se muestran en el orden cargado.

Los valores que actualmente pueden simularse en un escenario son `noiseLevel`
y `pulse`. Una actualización manual mediante `PUT /api/data`
detiene el escenario activo.

La batería social se conserva en el estado y se muestra en el historial, pero no
forma parte de la configuración de ningún perfil ni de la simulación de
escenarios. El consumidor de la API debe establecerla enviando
`{"socialBattery": 75}` a `PUT /api/social-battery`; cambiar de perfil no la
reinicia.

Cada perfil de `/api/profiles` representa a una persona entrevistada e incluye
su configuración de Home, actividades del calendario,
factores que pueden desregularla y estrategias de autorregulación o prevención.
`PUT /api/profile` recibe `{"profileId": "nd1"}` y reinicia el simulador con los
valores del dispositivo de ese perfil. En cada respuesta de perfiles, la fecha
de las actividades se ajusta al día actual; sus horas de inicio y fin no cambian.
`/api/data` devuelve el perfil seleccionado junto con los valores actuales del
celular, sensor y batería social. La hora de `cellphone.dateTime` puede
modificarse mediante `PUT /api/data`; al consumir la respuesta, su día se ajusta
al día actual y se conserva la hora configurada. El objeto `profile` conserva
únicamente la configuración de Home, el mensaje, las actividades, los
desreguladores y la regulación; los valores dinámicos se exponen en los objetos
`cellphone`, `sensor` y `socialBattery`.

La especificacion completa se puede explorar en Swagger UI.

## Menu interactivo

Para operar Docker desde un menu en la terminal:

```bash
make menu
```

El menu permite levantar servicios, consultar su estado, ver logs y detenerlos con confirmacion. Tambien puedes ejecutar cada operacion directamente:

```bash
make status
make logs
make tunnel
make down-confirm
```

## Comandos Make

Ejecuta `make help` para consultar todos los comandos disponibles.

Los principales son `make dev`, `make build`, `make test`, `make up`, `make menu`, `make status`, `make logs` y `make down`.