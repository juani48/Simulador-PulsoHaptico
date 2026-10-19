export interface CellphoneData {
  noiseLevel: number;
  dateTime: string;
}
export interface SensorData { pulse: number; }
export interface ProfileActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  canGiveNotice: boolean;
}
export interface RegulationCondition {
  value: 'pulse' | 'noiseLevel';
  operator: '>' | '>=' | '<' | '<=';
  threshold: number;
}
export interface RegulationConfig {
  mode: 'regulation' | 'prevention';
  condition: RegulationCondition[];
  strategies: string[];
}
export interface NeurodivergentProfile {
  id: string;
  name: string;
  homeConfig: string;
  homeMessage?: string;
  activities: ProfileActivity[];
  dysregulators: string[];
  regulation: RegulationConfig;
}
export interface BridgeState {
  cellphone: CellphoneData;
  sensor: SensorData;
  socialBattery: number;
  selectedProfileId: string;
  profile: NeurodivergentProfile;
}
export interface HistoryPoint {
  t: string; noiseLevel: number; pulse: number; socialBattery: number;
}
export type ScenarioValue = 'noiseLevel' | 'pulse';
export interface ValueRange { minimum: number; maximum: number; }
export interface ScenarioStage {
  name: string;
  activity: string;
  description: string;
  durationSeconds: number;
  values: Partial<Record<ScenarioValue, ValueRange>>;
  image?: string;
  alert?: {
    title: string;
    message: string;
    strategies?: string[];
  };
}
export interface Scenario {
  id: string;
  profileId: string;
  name: string;
  description: string;
  durationSeconds: number;
  stages: ScenarioStage[];
  finalValues: Partial<Record<ScenarioValue, number>>;
  previewImage?: string;
  videoUrl?: string;
  sequenceImages: string[];
}
export interface ScenarioStatus {
  scenarioId: string | null;
  elapsedSeconds: number;
  totalSeconds: number;
  running: boolean;
  paused: boolean;
  currentStage?: ScenarioStage;
}
