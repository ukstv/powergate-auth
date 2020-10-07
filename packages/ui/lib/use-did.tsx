import React, { useContext, useEffect, useState } from "react";
import { EthereumAuthProvider } from "./ethereum-auth-provider";
import * as sha256 from "@stablelib/sha256";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import IdentityWallet from "identity-wallet";
import { definitions, schemas } from "@ceramicstudio/idx-constants";
import { IDX } from "@ceramicstudio/idx";
import { ThreeIdConnect } from "3id-connect";
import { DID } from "dids";

const CERAMIC_API = "https://ceramic.3boxlabs.com";

export enum Status {
  VOID = "VOID",
  ERROR = "ERROR",
  REQUESTING = "REQUESTING",
  CONNECTED = "CONNECTED",
}

export class UnreachableStatusError extends Error {
  constructor(status: never) {
    super(`Invalid status: ${status}`);
  }
}

interface DataVoid {
  status: Status.VOID;
}

interface ContextVoid extends DataVoid {
  connect(): void;
}

interface DataError {
  status: Status.ERROR;
  error: string;
}

interface ContextError extends DataError {
  connect(): void;
}

interface DataRequesting {
  status: Status.REQUESTING;
}

interface ContextRequesting extends DataRequesting {}

interface DataConnected {
  status: Status.CONNECTED;
  id: string;
}

export interface ContextConnected extends DataConnected {
  createJWS(payload: object): Promise<string>;
}

type DidContext =
  | ContextVoid
  | ContextError
  | ContextRequesting
  | ContextConnected;

type DidContextData = DataError | DataRequesting | DataConnected | DataVoid;

const DidContext = React.createContext<DidContext | null>(null);

export function useDID(): DidContext {
  const didContext = useContext(DidContext);
  if (didContext) {
    return didContext;
  } else {
    throw new Error(
      "useDID() can only be used inside of <DidProvider />, please declare it at a higher level."
    );
  }
}

export function DidProvider(props: React.PropsWithChildren<{}>) {
  const [state, setState] = useState<DidContextData>({ status: Status.VOID });
  const [identityWallet, setIdentityWallet] = useState(null);
  const [idx, setIdx] = useState<IDX>(null);
  const [threeIdConnect, setThreeIdConnect] = useState<ThreeIdConnect | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined" && !threeIdConnect) {
      const tt = new ThreeIdConnect("https://3idconnect.org/index.html");
      setThreeIdConnect(tt);
    }
  }, [threeIdConnect]);

  const ceramic = new CeramicClient(CERAMIC_API);

  const requestIdentity = async (ethereum: any): Promise<string> => {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
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
    const bytes = new Uint8Array(hex.match(/../g).map((b) => parseInt(b, 16)));
    const entropy = sha256.hash(bytes);
    const getPermission = async () => [];
    const idw = await IdentityWallet.create({
      getPermission,
      ceramic: ceramic,
      authSecret: entropy,
      authId: account,
    });
    setIdentityWallet(idw);
    const didProvider = idw.getDidProvider();
    await ceramic.setDIDProvider(didProvider);
    // @ts-ignore
    const idx = new IDX({ ceramic: ceramic, definitions, schemas });
    setIdx(idx);
    return idx.did.id;
  };

  const connect = () => {
    const isMetaMaskAvailable =
      typeof window !== "undefined" &&
      typeof (window as any).ethereum !== "undefined";
    if (isMetaMaskAvailable) {
      const ethereum = (window as any).ethereum;
      setState({
        status: Status.REQUESTING,
      });
      requestIdentity(ethereum)
        .then((did) => {
          setState({
            status: Status.CONNECTED,
            id: did,
          });
        })
        .catch((error) => {
          setState({
            status: Status.ERROR,
            error: error.message,
          });
        });
    } else {
      setState({
        status: Status.ERROR,
        error: "MetaMask is not installed",
      });
    }
  };

  const providerContext: () => DidContext = () => {
    switch (state.status) {
      case Status.VOID:
        return {
          ...state,
          connect: connect,
        };
      case Status.REQUESTING:
        return state;
      case Status.ERROR:
        return {
          ...state,
          connect: connect,
        };
      case Status.CONNECTED:
        return {
          ...state,
          createJWS: async (payload: object) => {
            return idx.did.createJWS(payload);
          },
        };
    }
  };

  return (
    <DidContext.Provider value={providerContext()}>
      {props.children}
    </DidContext.Provider>
  );
}
