import type { NeurodivergentProfile } from './types.js';

export type ProfileSeed = NeurodivergentProfile & {
  initialPulse: number;
  initialNoiseLevel: number;
  initialDateTime: string;
};

export const profiles: ProfileSeed[] = [
  {
    id: 'nd1',
    name: 'Persona ND1',
    homeConfig: 'Config. A',
    initialPulse: 70,
    initialNoiseLevel: 0,
    initialDateTime: '2026-10-21T08:00:00-03:00',
    activities: [
      { id: 'nd1-charla-ia', name: 'Charla sobre IA', type: 'Dar conferencia', date: '2026-10-22', startTime: '09:00', endTime: '10:00', canGiveNotice: false },
      { id: 'nd1-reunion-investigacion', name: 'Reunión de Investigación', type: 'Reunión - Trabajo', date: '2026-10-22', startTime: '11:00', endTime: '12:00', canGiveNotice: false }
    ],
    dysregulators: ['Ruido emergente del ambiente', 'Murmullo de personas', 'Hablar en público (ansiedad)', 'Situaciones no planificadas', 'Sociabilizar', 'Discusiones que no llegan a ningún lado'],
    regulation: { mode: 'autorregulación', condition: 'Pulso > 75 y no actividad', strategies: ['Respiración'] }
  },
  {
    id: 'nd2',
    name: 'Persona ND2',
    homeConfig: 'Config. B',
    initialPulse: 65,
    initialNoiseLevel: 0,
    initialDateTime: '2026-10-21T08:00:00-03:00',
    activities: [
      { id: 'nd2-materia-x', name: 'Materia X', type: 'Dar clase', date: '2026-10-22', startTime: '08:00', endTime: '10:00', canGiveNotice: false },
      { id: 'nd2-evento-universidad', name: 'Evento de la Universidad', type: 'Evento/Difusion', date: '2026-10-22', startTime: '18:00', endTime: '19:00', canGiveNotice: true }
    ],
    dysregulators: ['Ruido emergente del ambiente', 'Murmullo de personas', 'Hablar en público (ansiedad)', 'Aglomeración de personas', 'Absorber las emociones de otros'],
    regulation: { mode: 'prevención', condition: 'Pulso > 75 y no actividad', strategies: ['Musica', 'Proponer movimientos', 'Agarrarse ella misma el pulgar con la mano'] }
  },
  {
    id: 'nd3',
    name: 'Persona ND3',
    homeConfig: 'Config. C',
    homeMessage: 'Volve a vos',
    initialPulse: 60,
    initialNoiseLevel: 0,
    initialDateTime: '2026-10-21T08:00:00-03:00',
    activities: [
      { id: 'nd3-ia-educacion', name: 'IA en Educación', type: 'Asistir charla', date: '2026-10-22', startTime: '09:30', endTime: '11:00', canGiveNotice: true },
      { id: 'nd3-reunion-investigacion', name: 'Reunión de Investigación', type: 'Reunión - Trabajo', date: '2026-10-22', startTime: '13:00', endTime: '14:00', canGiveNotice: true }
    ],
    dysregulators: ['Ruido emergente del ambiente', 'Murmullo de personas', 'Hablar en público (ansiedad)', 'Situaciones no planificadas', 'Deadlines simultáneos', 'Situaciones de evaluación'],
    regulation: { mode: 'prevención', condition: 'Pulso > 75', strategies: ['Respiración'] }
  }
];
