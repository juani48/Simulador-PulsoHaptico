import type { Scenario } from './types.js';

export function loadScenarios(): Scenario[] {
  return [
    {
      id: 'desregulacion',
      name: 'Desregulación',
      description: 'Aumenta la activación hasta un pico y luego se estabiliza.',
      durationSeconds: 20,
      stages: [
        {
          durationSeconds: 8,
          values: {
            noiseLevel: { minimum: 55, maximum: 80 },
            pulse: { minimum: 85, maximum: 125 }
          }
        },
        {
          durationSeconds: 4,
          values: {
            noiseLevel: { minimum: 70, maximum: 80 },
            pulse: { minimum: 120, maximum: 140 }
          }
        },
        {
          durationSeconds: 8,
          values: {
            noiseLevel: { minimum: 0, maximum: 15 },
            pulse: { minimum: 105, maximum: 115 }
          }
        }
      ],
      finalValues: { noiseLevel: 0, pulse: 110 },
      sequenceImages: []
    },
    {
      id: 'regulacion',
      name: 'Regulación',
      description: 'Reduce progresivamente el pulso al recuperar la calma.',
      durationSeconds: 20,
      stages: [
        {
          durationSeconds: 7,
          values: {
            noiseLevel: { minimum: 0, maximum: 10 },
            pulse: { minimum: 90, maximum: 105 }
          }
        },
        {
          durationSeconds: 7,
          values: {
            noiseLevel: { minimum: 0, maximum: 5 },
            pulse: { minimum: 75, maximum: 90 }
          }
        },
        {
          durationSeconds: 6,
          values: {
            noiseLevel: { minimum: 0, maximum: 0 },
            pulse: { minimum: 60, maximum: 75 }
          }
        }
      ],
      finalValues: { noiseLevel: 0, pulse: 68 },
      sequenceImages: []
    }
  ];
}
