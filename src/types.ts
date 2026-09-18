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
