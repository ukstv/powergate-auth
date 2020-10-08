import { DID } from "dids";
import { BehaviorSubject } from "rxjs";
import * as Ethereum from "./ethereum";
import { EthereumAuthProvider } from "./ethereum-auth-provider";
import { filter } from "rxjs/operators";
import { OneOffSubject } from "./plumbing/one-off-subject";
import * as sha256 from "@stablelib/sha256";
import IdentityWallet from "identity-wallet";
import { IDX } from "@ceramicstudio/idx";
import type { CeramicApi } from "@ceramicnetwork/ceramic-common";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import { definitions, schemas } from "@ceramicstudio/idx-constants";

const CERAMIC_API = "https://ceramic.3boxlabs.com";

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
  did: DID;
  idx: IDX;
  ceramic: CeramicApi;
};

export type State = DisconnectedState | ProgressState | ConnectedState;

export const state$ = new BehaviorSubject<State>({
  status: Status.DISCONNECTED,
});

export async function connect(): Promise<{
  ceramic: CeramicClient;
  idx: IDX;
  did: DID;
}> {
  const ethereum = await Ethereum.connect$()
    .pipe(
      filter(
        (s): s is Ethereum.ConnectedState =>
          s.status === Ethereum.Status.CONNECTED
      )
    )
    .toPromise();
  const authProvider = new EthereumAuthProvider(
    ethereum.provider,
    ethereum.account
  );
  // await threeIdConnect.connect(authProvider);
  // const didProvider = await threeIdConnect.getDidProvider();
  //
  // const did = new DID({ provider: didProvider });
  //
  // await did.authenticate();
  // return did.id
  const message = "Add this account as a Ceramic authentication method";
  const authSecret = await authProvider.authenticate(message);
  const hex = authSecret.slice(2);
  const bytes = new Uint8Array(hex.match(/../g).map((b) => parseInt(b, 16)));
  const entropy = sha256.hash(bytes);
  const getPermission = async () => [];
  const ceramic = new CeramicClient(CERAMIC_API);
  const identityWallet = await IdentityWallet.create({
    getPermission,
    ceramic: ceramic,
    authSecret: entropy,
    authId: ethereum.account,
  });
  const didProvider = identityWallet.getDidProvider();
  await ceramic.setDIDProvider(didProvider);
  // @ts-ignore
  const idx = new IDX({ ceramic: ceramic, definitions, schemas });
  return {
    idx: idx,
    did: idx.did,
    ceramic: ceramic,
  };
}

export async function connect$() {
  const progress = new OneOffSubject<State>({ status: Status.PROGRESS });
  progress.subscribe(state$);
  connect()
    .then((results) => {
      progress.next({
        status: Status.CONNECTED,
        did: results.did,
        idx: results.idx,
        ceramic: results.ceramic,
      });
    })
    .catch((error) => {
      progress.error(error);
    });
  return progress.asObservable();
}
