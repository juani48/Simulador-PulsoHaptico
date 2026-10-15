import type { Activity, BridgeState, HistoryPoint, Scenario, ScenarioStatus } from './types.js';

const MAX_HISTORY = 60;

class Simulator {
  private state!: BridgeState;
  private history: HistoryPoint[] = [];
  private readonly scenarios: Scenario[];
  private selectedActivityId = '';
  private readonly activityDisturbingOverrides = new Map<string, boolean>();
  private readonly activityFactorOverrides = new Map<string, Activity['dysregulatingFactors']>();
  private scenarioTimer: ReturnType<typeof setInterval> | null = null;
  private activeScenario: { scenario: Scenario; startedAt: number } | null = null;

  constructor(scenarios: Scenario[]) {
    this.scenarios = scenarios;
    this.state = this.initialState();
    this.history.push(this.toPoint(this.state));
  }

  private initialState(): BridgeState {
    const now = Date.now();
    return {
      cellphone: {
        noiseLevel: 45,
        dateTime: new Date().toISOString()
      },
      sensor: { pulse: 60 },
      socialBattery: 100,
      activity: ''
    };
  }

  private initialActivities(now: number): Activity[] {
    const activities: Activity[] = [
      {
        id: 'activity-before',
        name: 'Trabajo concentrado',
        description: 'Bloque de trabajo individual que requiere atención sostenida.',
        canBeDisturbing: true,
        dysregulatingFactors: ['Deadlines simultáneos', 'Sobrecarga de actividades (requieren procesamiento información)'],
        dateTime: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        duration: 2
      },
      {
        id: 'activity-current',
        name: 'Encuentro social',
        description: 'Reunión con otras personas para conversar y compartir un espacio.',
        canBeDisturbing: true,
        dysregulatingFactors: ['Murmullo de personas', 'Sociabilizar', 'Aglomeración de personas'],
        dateTime: new Date(now).toISOString(),
        duration: 2
      },
      {
        id: 'activity-after',
        name: 'Presentación',
        description: 'Exposición oral frente a un grupo de personas.',
        canBeDisturbing: true,
        dysregulatingFactors: ['Hablar en público', 'Situaciones de evaluación', 'Situaciones no planificadas'],
        dateTime: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
        duration: 2
      }
    ];
    return activities.map(activity => {
      const canBeDisturbing = this.activityDisturbingOverrides.get(activity.id);
      const dysregulatingFactors = this.activityFactorOverrides.get(activity.id);
      return {
        ...activity,
        ...(canBeDisturbing === undefined ? {} : { canBeDisturbing }),
        ...(dysregulatingFactors === undefined ? {} : { dysregulatingFactors })
      };
    });
  }

  private toPoint(s: BridgeState): HistoryPoint {
    return {
      t: s.cellphone.dateTime,
      noiseLevel: s.cellphone.noiseLevel,
      pulse: s.sensor.pulse,
      socialBattery: s.socialBattery
    };
  }

  setData(state: BridgeState & { selectedActivity?: string }) {
    this.stopScenario();
    const { selectedActivity: _selectedActivity, ...data } = state;
    this.state = {
      ...data,
      socialBattery: data.socialBattery ?? this.state.socialBattery,
      activity: this.state.activity
    };
    this.recordState();
  }

  setSocialBattery(value: number) {
    this.state = {
      ...this.state,
      socialBattery: value,
      cellphone: {
        ...this.state.cellphone,
        dateTime: new Date().toISOString()
      }
    };
    this.recordState();
  }

  getCurrent(): BridgeState {
    const activities = this.initialActivities(Date.now());
    const selectedActivity = activities.find(activity => activity.id === this.selectedActivityId) ?? '';
    this.state = {
      ...this.state,
      activity: selectedActivity
    };
    return this.state;
  }

  getActivities(): Activity[] {
    return this.initialActivities(Date.now());
  }

  selectActivity(activityId: string) {
    this.selectedActivityId = activityId;
  }

  setActivityDisturbing(activityId: string, canBeDisturbing: boolean) {
    const activity = this.initialActivities(Date.now()).find(candidate => candidate.id === activityId);
    if (!activity) throw new Error(`Actividad desconocida: ${activityId}`);
    this.activityDisturbingOverrides.set(activityId, canBeDisturbing);
  }

  setActivitySettings(
    activityId: string,
    settings: { canBeDisturbing: boolean; dysregulatingFactors: Activity['dysregulatingFactors'] }
  ) {
    const activity = this.initialActivities(Date.now()).find(candidate => candidate.id === activityId);
    if (!activity) throw new Error(`Actividad desconocida: ${activityId}`);
    this.activityDisturbingOverrides.set(activityId, settings.canBeDisturbing);
    this.activityFactorOverrides.set(activityId, settings.dysregulatingFactors);
  }
  getHistory(): HistoryPoint[] { return this.history; }

  getScenarios(): Scenario[] { return this.scenarios; }

  getScenarioStatus(): ScenarioStatus {
    if (!this.activeScenario) {
      return { scenarioId: null, elapsedSeconds: 0, totalSeconds: 0, running: false };
    }
    const elapsedSeconds = Math.min(
      Math.floor((Date.now() - this.activeScenario.startedAt) / 1000),
      this.activeScenario.scenario.durationSeconds
    );
    return {
      scenarioId: this.activeScenario.scenario.id,
      elapsedSeconds,
      totalSeconds: this.activeScenario.scenario.durationSeconds,
      running: true
    };
  }

  startScenario(id: string): ScenarioStatus {
    const scenario = this.scenarios.find(candidate => candidate.id === id);
    if (!scenario) throw new Error(`Escenario desconocido: ${id}`);

    this.stopScenario();
    this.activeScenario = { scenario, startedAt: Date.now() };
    this.applyScenarioSecond(0);
    this.scenarioTimer = setInterval(() => this.advanceScenario(), 1000);
    return this.getScenarioStatus();
  }

  private advanceScenario() {
    if (!this.activeScenario) return;
    const elapsedSeconds = Math.floor(
      (Date.now() - this.activeScenario.startedAt) / 1000
    );
    if (elapsedSeconds >= this.activeScenario.scenario.durationSeconds) {
      this.applyFinalValues(this.activeScenario.scenario);
      this.stopScenario();
      return;
    }
    this.applyScenarioSecond(elapsedSeconds);
  }

  private applyScenarioSecond(second: number) {
    if (!this.activeScenario) return;
    let stageStart = 0;
    const stage = this.activeScenario.scenario.stages.find(candidate => {
      const stageEnd = stageStart + candidate.durationSeconds;
      const matches = second >= stageStart && second < stageEnd;
      stageStart = stageEnd;
      return matches;
    });
    if (!stage) return;

    const nextState = structuredClone(this.state);
    for (const [key, range] of Object.entries(stage.values)) {
      const value = this.randomValue(range.minimum, range.maximum);
      if (key === 'noiseLevel') nextState.cellphone.noiseLevel = value;
      if (key === 'pulse') nextState.sensor.pulse = value;
    }
    nextState.cellphone.dateTime = new Date().toISOString();
    this.state = nextState;
    this.recordState();
  }

  private applyFinalValues(scenario: Scenario) {
    const nextState = structuredClone(this.state);
    for (const [key, value] of Object.entries(scenario.finalValues)) {
      if (key === 'pulse') nextState.sensor.pulse = value;
      if (key === 'noiseLevel') nextState.cellphone.noiseLevel = value;
    }
    nextState.cellphone.dateTime = new Date().toISOString();
    this.state = nextState;
    this.recordState();
  }

  private randomValue(minimum: number, maximum: number): number {
    return Math.round(minimum + Math.random() * (maximum - minimum));
  }

  private recordState() {
    this.history.push(this.toPoint(this.state));
    if (this.history.length > MAX_HISTORY) this.history.shift();
  }

  private stopScenario() {
    if (this.scenarioTimer) clearInterval(this.scenarioTimer);
    this.scenarioTimer = null;
    this.activeScenario = null;
  }
}

import { loadScenarios } from './scenarios.js';

export const simulator = new Simulator(loadScenarios());
