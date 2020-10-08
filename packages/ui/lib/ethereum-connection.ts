import { BehaviorSubject, Observable } from "rxjs";
import { InitSubject } from "./plumbing/init-subject";
import React, { useContext } from "react";
import { useSubject } from "./plumbing/use-subject";
import ethereum from "@ukstv/3id-blockchain-utils/src/blockchains/ethereum";

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

export class EthereumConnection extends InitSubject<State> {
  constructor() {
    super({ status: Status.DISCONNECTED });
  }

  connect$(): Observable<State> {
    const progress = new BehaviorSubject<State>({ status: Status.PROGRESS });
    const subscription = progress.subscribe(this);
    connect()
      .then((connection) => {
        progress.next({
          status: Status.CONNECTED,
          provider: connection.provider,
          account: connection.account,
        });
        progress.complete();
      })
      .catch((error) => {
        progress.next({
          status: Status.DISCONNECTED,
        });
        subscription.unsubscribe();
        progress.error(error);
      });

    return progress.asObservable();
  }
}

export const connection$ = new EthereumConnection();

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

export const EthereumContext = React.createContext(new EthereumConnection());

export function useEthereum(): EthereumConnection {
  return useContext(EthereumContext);
}
