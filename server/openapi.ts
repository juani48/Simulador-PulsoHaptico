const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Pulso Háptico API',
    version: '1.0.0',
    description: 'API para consultar y actualizar los datos simulados del celular y del sensor.'
  },
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [{ name: 'Simulación', description: 'Datos simulados del dispositivo' }],
  paths: {
    '/api/get-data': {
      get: {
        tags: ['Simulación'],
        summary: 'Obtiene el estado actual',
        responses: {
          '200': {
            description: 'Estado actual del celular y del sensor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BridgeState' }
              }
            }
          }
        }
      }
    },
    '/api/history': {
      get: {
        tags: ['Simulación'],
        summary: 'Obtiene el historial de mediciones',
        responses: {
          '200': {
            description: 'Hasta 60 mediciones simuladas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/HistoryPoint' }
                }
              }
            }
          }
        }
      }
    },
    '/api/data': {
      put: {
        tags: ['Simulación'],
        summary: 'Actualiza el estado simulado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BridgeState' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Estado actualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BridgeState' }
              }
            }
          }
        }
      }
    },
    '/api/scenarios': {
      get: {
        tags: ['Simulación'],
        summary: 'Obtiene los escenarios disponibles',
        responses: { '200': { description: 'Catálogo de escenarios' } }
      }
    },
    '/api/scenario-status': {
      get: {
        tags: ['Simulación'],
        summary: 'Obtiene el progreso del escenario activo',
        responses: { '200': { description: 'Estado de ejecución del escenario' } }
      }
    },
    '/api/scenarios/{id}/start': {
      post: {
        tags: ['Simulación'],
        summary: 'Inicia un escenario',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Escenario iniciado' }, '404': { description: 'Escenario inexistente' } }
      }
    }
  },
  components: {
    schemas: {
      Position: {
        type: 'object',
        required: ['lat', 'lon'],
        properties: {
          lat: { type: 'number', format: 'double', example: -34.6118 },
          lon: { type: 'number', format: 'double', example: -58.4173 }
        }
      },
      CellphoneData: {
        type: 'object',
        required: ['position', 'noiseLevel', 'dateTime', 'nearbyPeople'],
        properties: {
          position: { $ref: '#/components/schemas/Position' },
          noiseLevel: { type: 'number', example: 45 },
          dateTime: { type: 'string', format: 'date-time' },
          nearbyPeople: { type: 'integer', example: 0 }
        }
      },
      SensorData: {
        type: 'object',
        required: ['pulse'],
        properties: {
          pulse: { type: 'number', example: 60 }
        }
      },
      BridgeState: {
        type: 'object',
        required: ['cellphone', 'sensor'],
        properties: {
          cellphone: { $ref: '#/components/schemas/CellphoneData' },
          sensor: { $ref: '#/components/schemas/SensorData' }
        }
      },
      HistoryPoint: {
        type: 'object',
        required: ['t', 'noiseLevel', 'nearbyPeople', 'pulse'],
        properties: {
          t: { type: 'string', format: 'date-time' },
          noiseLevel: { type: 'number', example: 45 },
          nearbyPeople: { type: 'integer', example: 0 },
          pulse: { type: 'number', example: 60 }
        }
      },
      ValueRange: {
        type: 'object',
        required: ['minimum', 'maximum'],
        properties: { minimum: { type: 'number' }, maximum: { type: 'number' } }
      },
      Scenario: {
        type: 'object',
        required: ['id', 'name', 'description', 'durationSeconds', 'stages', 'finalValues', 'sequenceImages'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          durationSeconds: { type: 'integer' },
          stages: { type: 'array', items: { type: 'object' } },
          finalValues: { type: 'object' },
          previewImage: { type: 'string' },
          sequenceImages: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};

export default openapiDocument;