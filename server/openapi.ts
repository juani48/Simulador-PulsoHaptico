const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Pulso Háptico API',
    version: '1.0.0',
    description: 'API para consultar datos simulados y actualizar la batería social externa.'
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
        '/api/social-battery': {
          put: {
            tags: ['Simulación'],
            summary: 'Actualiza la batería social externa',
            description: 'Establece el valor de batería social. No es modificado por los escenarios.',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SocialBatteryUpdate' }
                }
              }
            },
            responses: {
              '200': {
                description: 'Batería social actualizada',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/BridgeState' }
                  }
                }
              },
              '400': { description: 'Valor inválido: debe estar entre 0 y 100' }
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
      CellphoneData: {
        type: 'object',
        required: ['noiseLevel', 'dateTime'],
        properties: {
          noiseLevel: { type: 'number', example: 45 },
          dateTime: { type: 'string', format: 'date-time' }
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
        required: ['cellphone', 'sensor', 'socialBattery'],
        properties: {
          cellphone: { $ref: '#/components/schemas/CellphoneData' },
          sensor: { $ref: '#/components/schemas/SensorData' },
          socialBattery: { type: 'number', minimum: 0, maximum: 100, example: 75 }
        }
      },
      SocialBatteryUpdate: {
        type: 'object',
        required: ['socialBattery'],
        properties: {
          socialBattery: { type: 'number', minimum: 0, maximum: 100, example: 75 }
        }
      },
      HistoryPoint: {
        type: 'object',
        required: ['t', 'noiseLevel', 'pulse', 'socialBattery'],
        properties: {
          t: { type: 'string', format: 'date-time' },
          noiseLevel: { type: 'number', example: 45 },
          pulse: { type: 'number', example: 60 },
          socialBattery: { type: 'number', minimum: 0, maximum: 100, example: 75 }
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