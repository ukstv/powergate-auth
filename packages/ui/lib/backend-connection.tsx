import { InitSubject } from "./plumbing/init-subject";
import React, { useContext } from "react";
import * as Ceramic from "./ceramic-connection";
import { DID } from "dids";
import { useSubject } from "./plumbing/use-subject";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { IDX } from "@ceramicstudio/idx";
import { CeramicApi } from "@ceramicnetwork/ceramic-common";

export enum Status {
  DISCONNECTED,
  PROGRESS,
  CONNECTED,
}

export interface DisconnectedState {
  status: Status.DISCONNECTED;
  endpoint: string;
}

export interface ProgressState {
  status: Status.PROGRESS;
  endpoint: string;
}

export interface ConnectedState {
  status: Status.CONNECTED;
  authToken: string;
  did: DID;
  idx: IDX;
  ceramic: CeramicApi;
  endpoint: string;
}

export type State = DisconnectedState | ProgressState | ConnectedState;

export class BackendConnection extends InitSubject<State> {
  constructor(
    private readonly endpoint: string,
    private readonly ceramicConnection: Ceramic.CeramicConnection
  ) {
    super({ status: Status.DISCONNECTED, endpoint: endpoint });
  }

  connect$() {
    const progress = new BehaviorSubject<State>({
      status: Status.PROGRESS,
      endpoint: this.endpoint,
    });
    const subscription = progress.subscribe(this);
    connect(this.endpoint, this.ceramicConnection)
      .then((result) => {
        progress.next({
          status: Status.CONNECTED,
          authToken: result.authToken,
          ceramic: result.ceramic.ceramic,
          idx: result.ceramic.idx,
          did: result.ceramic.did,
          endpoint: this.endpoint,
        });
        progress.complete();
      })
      .catch((error) => {
        progress.next({
          status: Status.DISCONNECTED,
          endpoint: this.endpoint,
        });
        subscription.unsubscribe();
        progress.error(error);
      });
    return progress.asObservable();
  }
}

async function connect(
  endpoint: string,
  ceramicConnection: Ceramic.CeramicConnection
) {
  const ceramic = await ceramicConnection
    .connect$()
    .pipe(
      filter((s): s is Ceramic.ConnectedState => {
        return s.status === Ceramic.Status.CONNECTED;
      })
    )
    .toPromise();

  const authRequest = await fetch(
    `${endpoint}/auth?id=${ceramic.did.id}`
  ).then((r) => r.text());
  const tokenRequest = await ceramic.did.createJWS({ request: authRequest });
  const authToken = await fetch(`${endpoint}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tokenRequest: tokenRequest }),
  }).then((t) => t.text());
  return {
    authToken: authToken,
    ceramic: ceramic,
  };
}

export const BackendContext = React.createContext<BackendConnection | null>(
  null
);

export function useBackend() {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error(`useBackend() should be run under proper BackendProvider`);
  }
  return context;
}

export function BackendProvider(
  props: React.PropsWithChildren<{ endpoint: string }>
) {
  const ceramic = Ceramic.useCeramic();
  const connection = new BackendConnection(props.endpoint, ceramic);

  return (
    <BackendContext.Provider value={connection}>
      {props.children}
    </BackendContext.Provider>
  );
}
