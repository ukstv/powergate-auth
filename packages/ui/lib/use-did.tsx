import React, { useContext } from "react";
import { UseDidService, Status } from "./use-did.service";
import { useObservable } from "./use-observable";

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

type DidContext =
  | ContextVoid
  | ContextError
  | ContextRequesting
  | ContextConnected;

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
  const status = useObservable(
    UseDidService.instance.status$,
    UseDidService.instance.status
  );

  // const [threeIdConnect, setThreeIdConnect] = useState<ThreeIdConnect | null>(
  //   null
  // );
  //
  // useEffect(() => {
  //   if (typeof window !== "undefined" && !threeIdConnect) {
  //     setThreeIdConnect(new ThreeIdConnect("https://3idconnect.org/index.html"));
  //   }
  // }, [threeIdConnect]);

  const connect = async () => {
    await UseDidService.instance.requestIdentity();
  };

  const providerContext: () => DidContext = () => {
    switch (status) {
      case Status.VOID:
        return {
          status: Status.VOID,
          connect: connect,
        };
      case Status.PROGRESS:
        return {
          status: Status.PROGRESS,
        };
      case Status.ERROR:
        return {
          status: Status.ERROR,
          connect: connect,
        };
      case Status.CONNECTED:
        return {
          status: Status.CONNECTED,
          id: UseDidService.instance.idx.id,
          createJWS: async (payload: object) => {
            return UseDidService.instance.idx.did.createJWS(payload);
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
