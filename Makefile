COMPOSE ?= docker compose
PNPM ?= pnpm
APP_PORT ?= 5173
TUNNEL_PORT ?= 4040

GREEN := \033[0;32m
CYAN := \033[0;36m
YELLOW := \033[0;33m
RESET := \033[0m

.PHONY: help menu install dev build start test up up-dev tunnel logs logs-all restart down down-confirm status config

help: ## Muestra los comandos disponibles
	@printf "$(CYAN)Pulso Haptico$(RESET) - comandos disponibles\n\n"
	@awk 'BEGIN {FS = ":.*##"; printf "Uso: make <comando>\n\n"} /^[a-zA-Z_-]+:.*##/ {printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

menu: ## Abre un menu interactivo de operaciones
	@printf "$(CYAN)Pulso Haptico$(RESET)\n"
	@printf "1) Levantar Docker\n2) Ver estado\n3) Ver logs\n4) Detener Docker\n5) Salir\n\n"
	@printf "Selecciona una opcion [1-5]: "
	@read -r option; \
	case "$$option" in \
		1) $(MAKE) up ;; \
		2) $(MAKE) status ;; \
		3) $(MAKE) logs ;; \
		4) $(MAKE) down-confirm ;; \
		5) printf "Hasta luego.\n" ;; \
		*) printf "$(YELLOW)Opcion no valida.$(RESET)\n"; exit 1 ;; \
	esac

install: ## Instala las dependencias
	$(PNPM) install

dev: ## Inicia el servidor y el cliente en desarrollo
	$(PNPM) run dev

build: ## Compila el cliente y el servidor
	$(PNPM) run build

start: ## Inicia la aplicacion compilada
	$(PNPM) run start

test: ## Ejecuta las pruebas
	$(PNPM) run test

up: ## Levanta la aplicacion con Docker en segundo plano
	@APP_PORT=$(APP_PORT) TUNNEL_PORT=$(TUNNEL_PORT) $(COMPOSE) up -d --build --remove-orphans
	@printf "$(GREEN)Aplicacion levantada correctamente.$(RESET)\n"
	@printf "  Web y API:     http://localhost:$(APP_PORT)\n"
	@printf "  Swagger UI:    http://localhost:$(APP_PORT)/api-docs/\n"
	@printf "  OpenAPI JSON:  http://localhost:$(APP_PORT)/openapi.json\n"
	@printf "  Ngrok inspect: http://localhost:$(TUNNEL_PORT)\n"

up-dev: ## Levanta la aplicacion con Docker mostrando los logs
	APP_PORT=$(APP_PORT) TUNNEL_PORT=$(TUNNEL_PORT) $(COMPOSE) up --build --remove-orphans

tunnel: ## Inicia solamente el tunel ngrok
	@TUNNEL_PORT=$(TUNNEL_PORT) $(COMPOSE) up -d ngrok
	@printf "$(GREEN)Tunel ngrok iniciado.$(RESET) Panel: http://localhost:$(TUNNEL_PORT)\n"

logs: ## Muestra los logs del servicio bridge
	$(COMPOSE) logs -f bridge

logs-all: ## Muestra los logs de todos los servicios
	$(COMPOSE) logs -f

restart: ## Reinicia los servicios
	$(COMPOSE) restart

down: ## Detiene y elimina los servicios
	$(COMPOSE) down --remove-orphans
	@printf "$(GREEN)Servicios detenidos.$(RESET)\n"

down-confirm: ## Detiene Docker despues de pedir confirmacion
	@printf "$(YELLOW)Se detendran y eliminaran los contenedores. Continuar? [y/N] $(RESET)"
	@read -r answer; \
	case "$$answer" in \
		y|Y|yes|YES) $(MAKE) down ;; \
		*) printf "Operacion cancelada.\n" ;; \
	esac

status: ## Muestra el estado de los servicios Docker
	$(COMPOSE) ps

config: ## Valida y muestra la configuracion de Docker Compose
	$(COMPOSE) config
