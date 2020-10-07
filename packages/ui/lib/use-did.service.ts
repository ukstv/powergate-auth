import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import { EthereumAuthProvider } from "./ethereum-auth-provider";
import * as sha256 from "@stablelib/sha256";
import IdentityWallet from "identity-wallet";
import { IDX } from "@ceramicstudio/idx";
import { definitions, schemas } from "@ceramicstudio/idx-constants";
import { BehaviorSubject, Observable } from "rxjs";
import { EthereumService } from "./ethereum-service";

const CERAMIC_API = "https://ceramic.3boxlabs.com";

export class UnreachableStatusError extends Error {
  constructor(status: never) {
    super(`Invalid status: ${status}`);
  }
}

export enum Status {
  VOID = "VOID",
  ERROR = "ERROR",
  PROGRESS = "PROGRESS",
  CONNECTED = "CONNECTED",
}

interface ContextVoid {
  status: Status.VOID;
  connect(): void;
}

interface ContextError {
  status: Status.ERROR;
  connect(): void;
}

interface ContextRequesting {
  status: Status.PROGRESS;
}

export interface ContextConnected {
  status: Status.CONNECTED;
  id: string;
  createJWS(payload: object): Promise<string>;
}

export type UseDidContext =
  | ContextVoid
  | ContextError
  | ContextRequesting
  | ContextConnected;

export class UseDidService {
  readonly ceramic: CeramicClient;
  private _identityWallet?: IdentityWallet;
  private _idx?: IDX;
  private _status$ = new BehaviorSubject<Status>(Status.VOID);

  static instance = new UseDidService();

  constructor() {
    this.ceramic = new CeramicClient(CERAMIC_API);
  }

  get status(): Status {
    return this._status$.value;
  }

  get status$(): Observable<Status> {
    return this._status$.asObservable();
  }

  get identityWallet() {
    if (this._identityWallet) {
      return this._identityWallet;
    } else {
      throw new Error(`Request identity first`);
    }
  }

  get idx() {
    if (this._idx) {
      return this._idx;
    } else {
      throw new Error(`Request identity first`);
    }
  }

  mapStatusToContext(status: Status) {
    switch (status) {
      case Status.VOID:
        return {
          status: Status.VOID,
          connect: this.requestIdentity.bind(this),
        };
      case Status.PROGRESS:
        return {
          status: Status.PROGRESS,
        };
      case Status.ERROR:
        return {
          status: Status.ERROR,
          connect: this.requestIdentity.bind(this),
        };
      case Status.CONNECTED:
        return {
          status: Status.CONNECTED,
          id: UseDidService.instance.idx.id,
          createJWS: async (payload: object) => {
            return this.idx.did.createJWS(payload);
          },
        };
    }
  }

  async requestIdentity() {
    this._status$.next(Status.PROGRESS);
    try {
      const ethereum = await EthereumService.instance.ethereum();
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      const authProvider = new EthereumAuthProvider(ethereum, account);
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
      const bytes = new Uint8Array(
        hex.match(/../g).map((b) => parseInt(b, 16))
      );
      const entropy = sha256.hash(bytes);
      const getPermission = async () => [];
      this._identityWallet = await IdentityWallet.create({
        getPermission,
        ceramic: this.ceramic,
        authSecret: entropy,
        authId: account,
      });
      const didProvider = this._identityWallet.getDidProvider();
      await this.ceramic.setDIDProvider(didProvider);
      // @ts-ignore
      this._idx = new IDX({ ceramic: this.ceramic, definitions, schemas });
      this._status$.next(Status.CONNECTED);
    } catch (error) {
      console.error(error);
      this._status$.next(Status.ERROR);
      throw error;
    }
  }
}
