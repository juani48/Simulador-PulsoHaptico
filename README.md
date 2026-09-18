# Pulso Haptico Vue

Simulador de contexto que muestra datos de un telefono y un sensor de pulso, junto con el historial de mediciones. La interfaz Vue consulta el bridge cada dos segundos. El proyecto incluye una API Express, documentacion Swagger y un tunel opcional con ngrok.

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

La API expone estos endpoints:

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/api/get-data` | Obtiene el estado actual del telefono y el sensor |
| `GET` | `/api/history` | Obtiene hasta 60 mediciones historicas |
| `PUT` | `/api/data` | Actualiza el estado simulado mediante JSON |

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