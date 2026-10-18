const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Pulso Háptico API',
    version: '1.0.0',
    description: 'API para consultar datos simulados, actualizar la hora expuesta y establecer la batería social externa.'
  },
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [{ name: 'Simulación', description: 'Datos simulados del dispositivo' }],
  paths: {
    '/api/data': {
      get: {
        tags: ['Simulación'],
        summary: 'Obtiene el estado actual y el perfil seleccionado',
        description: 'Actualiza la fecha al día actual al responder. La hora configurada se conserva.',
        responses: {
          '200': {
            description: 'Estado actual del celular, sensor y perfil seleccionado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BridgeState' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Simulación'],
        summary: 'Actualiza los datos expuestos del dispositivo',
        description: 'Permite modificar la hora expuesta en cellphone.dateTime. La fecha se reemplaza por el día actual al responder.',
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
          dateTime: {
            type: 'string',
            format: 'date-time',
            description: 'La fecha se ajusta al día actual; la hora puede modificarse mediante PUT /api/data.'
          }
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
        required: ['cellphone', 'sensor', 'socialBattery', 'selectedProfileId', 'profile'],
        properties: {
          cellphone: { $ref: '#/components/schemas/CellphoneData' },
          sensor: { $ref: '#/components/schemas/SensorData' },
          socialBattery: { type: 'number', minimum: 0, maximum: 100, example: 75 },
          selectedProfileId: { type: 'string', example: 'nd1' },
          profile: { $ref: '#/components/schemas/NeurodivergentProfile' }
        }
      },
      NeurodivergentProfile: {
        type: 'object',
        required: ['id', 'name', 'homeConfig', 'activities', 'dysregulators', 'regulation'],
        properties: {
          id: { type: 'string', example: 'nd1' },
          name: { type: 'string', example: 'Persona ND1' },
          homeConfig: { type: 'string', example: 'Config. A' },
          homeMessage: { type: 'string', example: 'Volve a vos' },
          activities: {
            type: 'array',
            description: 'La fecha se establece al día actual en cada consumo; startTime y endTime permanecen fijos.',
            items: { $ref: '#/components/schemas/ProfileActivity' }
          },
          dysregulators: { type: 'array', items: { type: 'string' } },
          regulation: { type: 'object', properties: { mode: { type: 'string' }, condition: { type: 'string' }, strategies: { type: 'array', items: { type: 'string' } } } }
        }
      },
      ProfileActivity: {
        type: 'object',
        required: ['id', 'name', 'type', 'date', 'startTime', 'endTime', 'canGiveNotice'],
        properties: {
          id: { type: 'string' }, name: { type: 'string' }, type: { type: 'string' },
          date: { type: 'string', format: 'date' }, startTime: { type: 'string' },
          endTime: { type: 'string' }, canGiveNotice: { type: 'boolean' }
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