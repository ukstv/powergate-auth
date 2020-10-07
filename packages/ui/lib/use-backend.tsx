import React, { useContext, useState } from "react";

export enum Status {
  VOID = 'VOID',
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR'
}

interface DataVoid {
  status: Status.VOID;
  endpoint: string;
}

interface ContextVoid extends DataVoid {
  connect(): void;
}

interface DataConnecting {
  status: Status.CONNECTING;
  endpoint: string;
}

interface ContextConnecting extends DataConnecting {}

interface DataConnected {
  status: Status.CONNECTED;
  endpoint: string;
  token: string;
}

interface ContextConnected extends DataConnected {}

type Data = DataVoid | DataConnecting | DataConnected;
type Context = ContextVoid | ContextConnecting | ContextConnected;

const Context = React.createContext<Context>({
  status: Status.VOID,
  endpoint: "",
  connect: () => {},
});

export function useBackend() {
  return useContext(Context);
}

export function UseBackendProvider(
  props: React.PropsWithChildren<{ endpoint: string }>
) {
  const [data, setData] = useState<Data>({
    status: Status.VOID,
    endpoint: props.endpoint,
  });

  const contextValue: Context = {
    status: Status.VOID,
    endpoint: props.endpoint,
    connect: () => {
      console.log("connect");
    },
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
}
