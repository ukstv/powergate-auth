import React from "react";
import { Status, UnreachableStatusError, useDID } from "../lib/use-did";

export default function Home() {
  const did = useDID();

  const renderConnectButton = () => {
    switch (did.status) {
      case Status.CONNECTED:
        return <div>Connected: {did.id}</div>;
      case Status.ERROR:
        return (
          <div>
            <div>Oops, error: {did.error}</div>
            <button onClick={() => did.connect()}>Connect Again</button>
          </div>
        );
      case Status.REQUESTING:
        return <div>Connecting...</div>;
      case Status.VOID:
        return <button onClick={() => did.connect()}>Connect</button>;
      default:
        throw new UnreachableStatusError(did);
    }
  };

  return <div>{renderConnectButton()}</div>;
}
