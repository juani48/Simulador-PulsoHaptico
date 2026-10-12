export interface CellphoneData {
  position: { lat: number; lon: number };
  noiseLevel: number;
  dateTime: string;
  nearbyPeople: number;
}
export interface SensorData { pulse: number; }
export interface BridgeState { cellphone: CellphoneData; sensor: SensorData; }
export interface HistoryPoint {
  t: string; noiseLevel: number; nearbyPeople: number; pulse: number;
}
export type ScenarioValue = 'noiseLevel' | 'pulse' | 'nearbyPeople';
export interface ValueRange { minimum: number; maximum: number; }
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
