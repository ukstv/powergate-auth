import React from "react";
import { BehaviorSubject, Observable } from "rxjs";
import { OneOffSubject } from "./plumbing/one-off-subject";

export enum Status {
  DISCONNECTED,
  CONNECTED,
  PROGRESS,
}

export type DisconnectedState = {
  status: Status.DISCONNECTED;
};

export type ProgressState = {
  status: Status.PROGRESS;
};

export type ConnectedState = {
  status: Status.CONNECTED;
  provider: any;
  account: string;
};

export type State = DisconnectedState | ProgressState | ConnectedState;

export const state$ = new BehaviorSubject<State>({
  status: Status.DISCONNECTED,
});

async function connect(): Promise<{ provider: any; account: any }> {
  const isMetaMaskAvailable =
    typeof window !== "undefined" &&
    typeof (window as any).ethereum !== "undefined";
  if (isMetaMaskAvailable) {
    const provider = (window as any).ethereum;
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    return {
      provider,
      account,
    };
  } else {
    throw new Error(`MetaMask is not available`);
  }
}

export function connect$(): Observable<State> {
  const progress = new OneOffSubject<State>({ status: Status.PROGRESS });
  progress.subscribe(state$);
  connect()
    .then((connection) => {
      progress.next({
        status: Status.CONNECTED,
        provider: connection.provider,
        account: connection.account,
      });
    })
    .catch((error) => {
      progress.error(error);
    });

  return progress.asObservable();
}
