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
    '/api/data': {
      get: {
        tags: ['Simulación'],
        summary: 'Obtiene el estado actual y la actividad seleccionada',
        responses: {
          '200': {
            description: 'Estado actual del celular, sensor y actividad seleccionada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BridgeState' }
              }
            }
          }
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
              },
            }
          },
          '400': { description: 'Valor inválido: debe estar entre 0 y 100' }
        }
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
      DysregulatingFactor: {
        type: 'string',
        enum: [
          'Ruido emergente del ambiente',
          'Murmullo de personas',
          'Luces',
          'Olores',
          'Hablar en público',
          'Situaciones no planificadas',
          'Colores',
          'Sociabilizar',
          'Discusiones que no llegan a ningún lado',
          'Texturas',
          'Aglomeración de personas',
          'Usar calzado (tener el pie encerrado)',
          'Absorber las emociones de otros',
          'Poca tolerancia a la frustración',
          'Sobrecarga de actividades (requieren procesamiento información)',
          'Deadlines simultáneos',
          'Situaciones de evaluación'
        ]
      },
      BridgeState: {
        type: 'object',
        required: ['cellphone', 'sensor', 'socialBattery', 'activity'],
        properties: {
          cellphone: { $ref: '#/components/schemas/CellphoneData' },
          sensor: { $ref: '#/components/schemas/SensorData' },
          socialBattery: { type: 'number', minimum: 0, maximum: 100, example: 75 },
          activity: {
            oneOf: [
              { $ref: '#/components/schemas/Activity' },
              { type: 'string', enum: [''] }
            ],
            description: 'Actividad seleccionada; cadena vacía si no hay selección'
          }
        }
      },
      Activity: {
        type: 'object',
        required: [
          'id',
          'name',
          'description',
          'canBeDisturbing',
          'dysregulatingFactors',
          'dateTime',
          'duration'
        ],
        properties: {
          id: { type: 'string', example: 'activity-current' },
          name: { type: 'string', example: 'Actividad actual' },
          description: { type: 'string', example: 'Reunión con otras personas para conversar y compartir un espacio.' },
          canBeDisturbing: { type: 'boolean', example: true },
          dysregulatingFactors: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#/components/schemas/DysregulatingFactor' }
          },
          dateTime: { type: 'string', format: 'date-time' },
          duration: { type: 'number', example: 2, description: 'Duración en horas' }
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