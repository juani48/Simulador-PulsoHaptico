export interface CellphoneData {
  noiseLevel: number;
  dateTime: string;
}

export interface SensorData { pulse: number; }

export interface BridgeState {
  cellphone: CellphoneData;
  sensor: SensorData;
  socialBattery: number;
}

export interface HistoryPoint {
  t: string;
  noiseLevel: number;
  pulse: number;
  socialBattery: number;
}

export type ScenarioValue = 'noiseLevel' | 'pulse';

export interface ValueRange {
  minimum: number;
  maximum: number;
}

export interface ScenarioStage {
  durationSeconds: number;
  values: Partial<Record<ScenarioValue, ValueRange>>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  stages: ScenarioStage[];
  finalValues: Partial<Record<ScenarioValue, number>>;
  previewImage?: string;
  sequenceImages: string[];
}

export interface ScenarioStatus {
  scenarioId: string | null;
  elapsedSeconds: number;
  totalSeconds: number;
  running: boolean;
}