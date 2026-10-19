import type { BridgeState, HistoryPoint, NeurodivergentProfile, Scenario, ScenarioStatus } from './types.js';
import { profiles, type ProfileSeed } from './profiles.js';
import { formatDate, withCurrentDate } from './time.js';

const MAX_HISTORY = 60;

class Simulator {
  private state!: BridgeState;
  private history: HistoryPoint[] = [];
  private readonly scenarios: Scenario[];
  private readonly profileCatalog = profiles;
  private selectedProfileId: string;
  private scenarioTimer: ReturnType<typeof setInterval> | null = null;
  private activeScenario: { scenario: Scenario; startedAt: number; elapsedSeconds: number; paused: boolean } | null = null;
  private completedScenario: ScenarioStatus | null = null;
  private socialBattery = 0;

  constructor(scenarios: Scenario[]) {
    this.scenarios = scenarios;
    this.selectedProfileId = this.profileCatalog[0].id;
    this.state = this.initialState();
    this.history.push(this.toPoint(this.state));
  }

  private initialState(): BridgeState {
    const profile = this.getSelectedProfile();
    return {
      cellphone: {
        noiseLevel: profile.initialNoiseLevel,
        dateTime: profile.initialDateTime
      },
      sensor: { pulse: profile.initialPulse },
      socialBattery: this.socialBattery,
      selectedProfileId: profile.id,
      profile: this.toPublicProfile(profile)
    };
  }

  private getSelectedProfile(): ProfileSeed {
    return this.profileCatalog.find(profile => profile.id === this.selectedProfileId) ?? this.profileCatalog[0];
  }

  getProfiles(): NeurodivergentProfile[] {
    return this.profileCatalog.map(profile => this.toPublicProfile(profile, new Date()));
  }

  private toPublicProfile(
    { initialPulse: _initialPulse, initialNoiseLevel: _initialNoiseLevel, initialDateTime: _initialDateTime, ...profile }: ProfileSeed,
    consumedAt = new Date()
  ): NeurodivergentProfile {
    const currentDate = formatDate(consumedAt);
    return {
      ...profile,
      activities: profile.activities.map(activity => ({
        ...activity,
        date: currentDate
      }))
    };
  }

  selectProfile(profileId: string): BridgeState {
    if (!this.profileCatalog.some(profile => profile.id === profileId)) {
      throw new Error(`Perfil desconocido: ${profileId}`);
    }
    this.stopScenario();
    this.completedScenario = null;
    this.selectedProfileId = profileId;
    this.state = this.initialState();
    this.history = [this.toPoint(this.state)];
    return this.getCurrent();
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
    const { selectedProfileId: _selectedProfileId, profile: _profile, socialBattery: _socialBattery, ...data } = state;
    this.state = {
      ...data,
      socialBattery: this.socialBattery,
      selectedProfileId: this.selectedProfileId,
      profile: this.toPublicProfile(this.getSelectedProfile())
    };
    this.recordState();
  }

  setSocialBattery(value: number) {
    this.socialBattery = value;
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
    const consumedAt = new Date();
    this.state = {
      ...this.state,
      cellphone: {
        ...this.state.cellphone,
        dateTime: withCurrentDate(this.state.cellphone.dateTime, consumedAt)
      },
      selectedProfileId: this.selectedProfileId,
      profile: this.toPublicProfile(this.getSelectedProfile(), consumedAt)
    };
    return this.state;
  }
  getHistory(): HistoryPoint[] { return this.history; }

  getScenarios(): Scenario[] {
    return this.scenarios.filter(scenario => scenario.profileId === this.selectedProfileId);
  }

  getScenarioStatus(): ScenarioStatus {
    if (!this.activeScenario) {
      return this.completedScenario ?? { scenarioId: null, elapsedSeconds: 0, totalSeconds: 0, running: false, paused: false };
    }
    const elapsedSeconds = this.activeScenario.paused
      ? this.activeScenario.elapsedSeconds
      : Math.min(
        Math.floor((Date.now() - this.activeScenario.startedAt) / 1000),
      this.activeScenario.scenario.durationSeconds
      );
    return {
      scenarioId: this.activeScenario.scenario.id,
      elapsedSeconds,
      totalSeconds: this.activeScenario.scenario.durationSeconds,
      running: true,
      paused: this.activeScenario.paused,
      currentStage: this.getStage(
        this.activeScenario.scenario,
        Math.min(elapsedSeconds, this.activeScenario.scenario.durationSeconds - 1)
      )
    };
  }

  startScenario(id: string): ScenarioStatus {
    const scenario = this.getScenarios().find(candidate => candidate.id === id);
    if (!scenario) throw new Error(`Escenario desconocido: ${id}`);

    this.stopScenario();
    this.completedScenario = null;
    this.activeScenario = { scenario, startedAt: Date.now(), elapsedSeconds: 0, paused: false };
    this.applyScenarioSecond(0);
    this.scenarioTimer = setInterval(() => this.advanceScenario(), 1000);
    return this.getScenarioStatus();
  }

  toggleScenarioPause(): ScenarioStatus {
    if (!this.activeScenario) return this.getScenarioStatus();
    if (this.activeScenario.paused) {
      this.activeScenario.startedAt = Date.now() - this.activeScenario.elapsedSeconds * 1000;
      this.activeScenario.paused = false;
    } else {
      this.activeScenario.elapsedSeconds = Math.min(
        Math.floor((Date.now() - this.activeScenario.startedAt) / 1000),
        this.activeScenario.scenario.durationSeconds
      );
      this.activeScenario.paused = true;
    }
    return this.getScenarioStatus();
  }

  stopActiveScenario(): ScenarioStatus {
    this.stopScenario();
    this.completedScenario = null;
    return this.getScenarioStatus();
  }

  private advanceScenario() {
    if (!this.activeScenario || this.activeScenario.paused) return;
    const elapsedSeconds = Math.floor(
      (Date.now() - this.activeScenario.startedAt) / 1000
    );
    if (elapsedSeconds >= this.activeScenario.scenario.durationSeconds) {
      const scenario = this.activeScenario.scenario;
      this.applyFinalValues(scenario);
      this.completedScenario = {
        scenarioId: scenario.id,
        elapsedSeconds: scenario.durationSeconds,
        totalSeconds: scenario.durationSeconds,
        running: false,
        paused: false,
        currentStage: this.getStage(scenario, scenario.durationSeconds - 1)
      };
      this.stopScenario();
      return;
    }
    this.applyScenarioSecond(elapsedSeconds);
  }

  private applyScenarioSecond(second: number) {
    if (!this.activeScenario) return;
    const stage = this.getStage(this.activeScenario.scenario, second);
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

  private getStage(scenario: Scenario, second: number) {
    let stageStart = 0;
    return scenario.stages.find(candidate => {
      const stageEnd = stageStart + candidate.durationSeconds;
      const matches = second >= stageStart && second < stageEnd;
      stageStart = stageEnd;
      return matches;
    });
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
