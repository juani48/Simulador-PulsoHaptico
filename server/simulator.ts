import type { BridgeState, HistoryPoint, Scenario, ScenarioStatus } from './types.js';

const MAX_HISTORY = 60;

class Simulator {
  private state!: BridgeState;
  private history: HistoryPoint[] = [];
  private readonly scenarios: Scenario[];
  private scenarioTimer: ReturnType<typeof setInterval> | null = null;
  private activeScenario: { scenario: Scenario; startedAt: number } | null = null;

  constructor(scenarios: Scenario[]) {
    this.scenarios = scenarios;
    this.state = this.initialState();
    this.history.push(this.toPoint(this.state));
  }

  private initialState(): BridgeState {
    return {
      cellphone: {
        noiseLevel: 45,
        dateTime: new Date().toISOString()
      },
      sensor: { pulse: 60 },
      socialBattery: 100
    };
  }

  private toPoint(s: BridgeState): HistoryPoint {
    return {
      t: s.cellphone.dateTime,
      noiseLevel: s.cellphone.noiseLevel,
      pulse: s.sensor.pulse,
      socialBattery: s.socialBattery
    };
  }

  setData(state: BridgeState) {
    this.stopScenario();
    this.state = {
      ...state,
      socialBattery: state.socialBattery ?? this.state.socialBattery
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

  getCurrent(): BridgeState { return this.state; }
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
