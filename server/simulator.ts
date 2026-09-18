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

const MAX_HISTORY = 60;
const CENTER = { lat: -34.6118, lon: -58.4173 };

class Simulator {
  private state!: BridgeState;
  private history: HistoryPoint[] = [];

  constructor() {
    this.state = this.initialState();
    this.history.push(this.toPoint(this.state));
  }

  private initialState(): BridgeState {
    return {
      cellphone: {
        position: { ...CENTER },
        noiseLevel: 45,
        dateTime: new Date().toISOString(),
        nearbyPeople: 0
      },
      sensor: { pulse: 60 }
    };
  }

  private toPoint(s: BridgeState): HistoryPoint {
    return {
      t: s.cellphone.dateTime,
      noiseLevel: s.cellphone.noiseLevel,
      nearbyPeople: s.cellphone.nearbyPeople,
      pulse: s.sensor.pulse
    };
  }

  setData(state: BridgeState) {
    this.state = state;
    this.history.push(this.toPoint(this.state));
    if (this.history.length > MAX_HISTORY) this.history.shift();
  }

  getCurrent(): BridgeState { return this.state; }
  getHistory(): HistoryPoint[] { return this.history; }
}

export const simulator = new Simulator();
