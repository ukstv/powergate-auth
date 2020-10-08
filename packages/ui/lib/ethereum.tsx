import React from "react";
import { BehaviorSubject } from "rxjs";

export enum Status {
  DISCONNECTED,
  CONNECTED,
}

export type DisconnectedState = {
  status: Status.DISCONNECTED;
};

export type ConnectedState = {
  status: Status.CONNECTED;
  provider: any;
  account: string;
};

export type State = DisconnectedState | ConnectedState;

export class Dispatch {
  readonly #state$ = new BehaviorSubject<State>({
    status: Status.DISCONNECTED,
  });

  constructor() {}

  get state() {
    return this.#state$.value;
  }

  get state$() {
    return this.#state$.asObservable();
  }

  get isConnected(): boolean {
    return this.#state$.value.status === Status.CONNECTED;
  }

  async connect(): Promise<State> {
    if (this.#state$.value.status === Status.CONNECTED) {
      return this.#state$.value;
    } else {
      const isMetaMaskAvailable =
        typeof window !== "undefined" &&
        typeof (window as any).ethereum !== "undefined";
      if (isMetaMaskAvailable) {
        const provider = (window as any).ethereum;
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        const next = {
          status: Status.CONNECTED,
          provider,
          account,
        };
        this.#state$.next(next);
        return next;
      } else {
        throw new Error(`MetaMask is not available`);
      }
    }
  }
}

export const dispatch = new Dispatch()