import type { Scenario, ScenarioStage } from './types.js';

function stage(
  name: string,
  activity: string,
  description: string,
  durationSeconds: number,
  values: ScenarioStage['values'],
  extra: Pick<ScenarioStage, 'image' | 'alert'> = {}
): ScenarioStage {
  return { name, activity, description, durationSeconds, values, ...extra };
}

const breathingAlert = {
  title: 'Es momento de respirar',
  message: 'La actividad terminó. Comenzá una respiración consistente y diafragmática.',
  strategies: ['Inhalá lentamente', 'Exhalá más despacio', 'Repetí el ciclo varias veces']
};

export function loadScenarios(): Scenario[] {
  return [
    {
      id: 'nd1-escenario-1',
      profileId: 'nd1',
      name: 'ND1 · Escenario 1',
      description: 'Conferencia y regulación.',
      durationSeconds: 32,
      stages: [
        stage('Conferencia', 'Dar conferencia', 'La persona comienza a dar una conferencia.', 8, {
          noiseLevel: { minimum: 55, maximum: 65 },
          pulse: { minimum: 72, maximum: 82 }
        }, { image: '/media/nd1/e1/img1.jpg' }),
        stage('Balanceo', 'Dar conferencia', 'Se balancea levemente adelante-atrás desde los pies (reflejo automático).', 7, {
          noiseLevel: { minimum: 55, maximum: 65 },
          pulse: { minimum: 66, maximum: 74 }
        }, { image: '/media/nd1/e1/img2.jpg' }),
        stage('Conferencia con ruido', 'Dar conferencia', 'La persona continúa dando la conferencia y aumenta el nivel de ruido ambiente.', 9, {
          noiseLevel: { minimum: 70, maximum: 82 },
          pulse: { minimum: 78, maximum: 92 }
        }, { image: '/media/nd1/e1/img3.jpg' }),
        stage('Cierre', 'Sin actividad', 'Terminó la hora de la actividad.', 8, {
          noiseLevel: { minimum: 0, maximum: 10 },
          pulse: { minimum: 68, maximum: 76 }
        }, { image: '/media/nd1/e1/img4.jpg', alert: breathingAlert })
      ],
      finalValues: { noiseLevel: 0, pulse: 70 },
      previewImage: '/media/nd1/e1/img1.jpg',
      sequenceImages: ['/media/nd1/e1/img1.jpg', '/media/nd1/e1/img2.jpg', '/media/nd1/e1/img3.jpg', '/media/nd1/e1/img4.jpg']
    },
    {
      id: 'nd1-escenario-2',
      profileId: 'nd1',
      name: 'ND1 · Escenario 2',
      description: 'Reunión de investigación y regulación.',
      durationSeconds: 24,
      stages: [
        stage('Reunión de investigación', 'Reunión de Investigación', 'La persona participa en una reunión de su grupo de investigación. Aumenta el ruido ambiente.', 16, {
          noiseLevel: { minimum: 65, maximum: 78 },
          pulse: { minimum: 72, maximum: 84 }
        }, { image: '/media/nd1/e2/img1.jpg' }),
        stage('Cierre', 'Sin actividad', 'Terminó la hora de la actividad.', 8, {
          noiseLevel: { minimum: 0, maximum: 10 },
          pulse: { minimum: 66, maximum: 74 }
        }, { image: '/media/nd1/e2/img2.jpg', alert: breathingAlert })
      ],
      finalValues: { noiseLevel: 0, pulse: 68 },
      previewImage: '/media/nd1/e2/img1.jpg',
      sequenceImages: ['/media/nd1/e2/img1.jpg', '/media/nd1/e2/img2.jpg']
    },
    {
      id: 'nd2-escenario-3',
      profileId: 'nd2',
      name: 'ND2 · Escenario 3',
      description: 'Clase y estrategias de regulación.',
      durationSeconds: 24,
      stages: [
        stage('Clase', 'Dar clase', 'La persona comienza a dar una clase y aumenta el nivel de ruido ambiente.', 16, {
          noiseLevel: { minimum: 65, maximum: 82 },
          pulse: { minimum: 70, maximum: 84 }
        }, { image: '/media/nd2/e3/img1.jpg' }),
        stage('Cierre', 'Sin actividad', 'Terminó la hora de la actividad.', 8, {
          noiseLevel: { minimum: 0, maximum: 10 },
          pulse: { minimum: 65, maximum: 74 }
        }, { image: '/media/nd2/e3/img1.jpg', alert: { title: 'Elegí cómo regularte', message: 'Podés elegir música, movimientos o un patrón vibro-táctil.', strategies: ['Elegir música', 'Elegir movimientos', 'Elegir patrón vibro-táctil'] } })
      ],
      finalValues: { noiseLevel: 0, pulse: 66 },
      previewImage: '/media/nd2/e3/img1.jpg',
      sequenceImages: ['/media/nd2/e3/img1.jpg']
    },
    {
      id: 'nd2-escenario-4',
      profileId: 'nd2',
      name: 'ND2 · Escenario 4',
      description: 'Evento universitario y regulación.',
      durationSeconds: 18,
      stages: [
        stage('Evento universitario', 'Evento/Difusión', 'La persona participa en un evento social de la universidad. Aumenta el ruido ambiente.', 18, {
          noiseLevel: { minimum: 70, maximum: 88 },
          pulse: { minimum: 70, maximum: 86 }
        }, { image: '/media/nd2/e4/img1.jpg', alert: { title: 'Podés regularte', message: 'Revisá las estrategias disponibles cuando lo necesites.' } })
      ],
      finalValues: { noiseLevel: 0, pulse: 68 },
      previewImage: '/media/nd2/e4/img1.jpg',
      sequenceImages: ['/media/nd2/e4/img1.jpg']
    },
    {
      id: 'nd3-escenario-5',
      profileId: 'nd3',
      name: 'ND3 · Escenario 5',
      description: 'Charla magistral y respiración.',
      durationSeconds: 20,
      stages: [
        stage('Charla magistral', 'Asistir charla', 'La persona asiste a una charla magistral. El pulso comienza a aumentar.', 12, {
          noiseLevel: { minimum: 35, maximum: 50 },
          pulse: { minimum: 68, maximum: 82 }
        }, { image: '/media/nd3/e5/img1.jpg', alert: { title: 'Respirá', message: 'Probá una respiración diafragmática para volver a la calma.' } }),
        stage('Respiración', 'Sin actividad', 'La persona comienza a realizar una respiración diafragmática.', 8, {
          noiseLevel: { minimum: 0, maximum: 10 },
          pulse: { minimum: 58, maximum: 68 }
        }, { image: '/media/nd3/e5/img2.jpg', alert: { title: 'Respirá', message: 'Realizá una respiración diafragmática hasta recuperar la calma.' } })
      ],
      finalValues: { noiseLevel: 0, pulse: 62 },
      previewImage: '/media/nd3/e5/img1.jpg',
      sequenceImages: ['/media/nd3/e5/img1.jpg', '/media/nd3/e5/img2.jpg']
    },
    {
      id: 'nd3-escenario-6',
      profileId: 'nd3',
      name: 'ND3 · Escenario 6',
      description: 'Reunión de investigación y respiración.',
      durationSeconds: 20,
      stages: [
        stage('Reunión de investigación', 'Reunión de Investigación', 'La persona participa en una reunión de su grupo de investigación. Aumenta el ruido ambiente.', 12, {
          noiseLevel: { minimum: 65, maximum: 80 },
          pulse: { minimum: 68, maximum: 82 }
        }, { image: '/media/nd3/e6/img1.jpg', alert: { title: 'Respirá', message: 'Comenzá una respiración diafragmática.' } }),
        stage('Respiración sentada', 'Sin actividad', 'La persona comienza a realizar una respiración diafragmática sentada.', 8, {
          noiseLevel: { minimum: 0, maximum: 10 },
          pulse: { minimum: 58, maximum: 68 }
        }, { image: '/media/nd3/e6/img2.jpg', alert: { title: 'Respirá', message: 'Realizá una respiración diafragmática sentada.' } })
      ],
      finalValues: { noiseLevel: 0, pulse: 62 },
      previewImage: '/media/nd3/e6/img1.jpg',
      sequenceImages: ['/media/nd3/e6/img1.jpg', '/media/nd3/e6/img2.jpg']
    }
  ];
}
