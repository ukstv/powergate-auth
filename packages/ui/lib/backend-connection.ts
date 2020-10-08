import { InitSubject } from "./plumbing/init-subject";

export enum Status {
  DISCONNECTED,
  PROGRESS,
  CONNECTED,
}

export interface DisconnectedState {
  status: Status.DISCONNECTED;
}

export interface ProgressState {
  status: Status.PROGRESS;
}

export interface ConnectedState {
  status: Status.CONNECTED;
}

export type State = DisconnectedState | ProgressState | ConnectedState;

export const state$ = new InitSubject<State>({ status: Status.DISCONNECTED });
