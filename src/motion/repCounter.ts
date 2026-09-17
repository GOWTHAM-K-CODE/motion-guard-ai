import type { SquatPhase } from "./exerciseDetector";

export interface RepCounterState {
  reps: number;
  phase: SquatPhase;
  previousPhase: SquatPhase;
  depthReached: boolean;
  lastRepTimestamp: number;
}

export interface RepCounterResult {
  reps: number;
  phase: SquatPhase;
  previousPhase: SquatPhase;
  depthReached: boolean;
  repCompleted: boolean;
}

const MIN_REP_INTERVAL = 700;

export class RepCounter {
  private state: RepCounterState = {
    reps: 0,
    phase: "unknown",
    previousPhase: "unknown",
    depthReached: false,
    lastRepTimestamp: 0,
  };

  update(
    phase: SquatPhase,
    timestamp = performance.now()
  ): RepCounterResult {
    const previousPhase = this.state.phase;

    let repCompleted = false;

    /*
     * A squat must reach the bottom phase before
     * it can be counted as a completed repetition.
     */
    if (phase === "bottom") {
      this.state.depthReached = true;
    }

    /*
     * When the user returns to standing after
     * reaching sufficient depth, count one rep.
     */
    if (
      phase === "standing" &&
      this.state.depthReached &&
      previousPhase !== "standing" &&
      timestamp - this.state.lastRepTimestamp >=
        MIN_REP_INTERVAL
    ) {
      this.state.reps += 1;

      this.state.lastRepTimestamp =
        timestamp;

      this.state.depthReached = false;

      repCompleted = true;
    }

    this.state.previousPhase =
      previousPhase;

    this.state.phase = phase;

    return {
      reps: this.state.reps,
      phase: this.state.phase,
      previousPhase:
        this.state.previousPhase,
      depthReached:
        this.state.depthReached,
      repCompleted,
    };
  }

  reset(): void {
    this.state = {
      reps: 0,
      phase: "unknown",
      previousPhase: "unknown",
      depthReached: false,
      lastRepTimestamp: 0,
    };
  }

  getReps(): number {
    return this.state.reps;
  }

  getState(): RepCounterState {
    return {
      ...this.state,
    };
  }
}