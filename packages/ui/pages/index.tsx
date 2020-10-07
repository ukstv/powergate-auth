import React, { useEffect, useState } from "react";

import {
  ContextConnected,
  Status,
  UnreachableStatusError,
  useDID,
} from "../lib/use-did";

export default function Home() {
  const did = useDID();
  const [authToken, setAuthToken] = useState(null);

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

  const requestAuth = async (did: ContextConnected) => {
    const authRequest = await fetch(
      `http://localhost:3000/auth?id=${did.id}`
    ).then((r) => r.text());
    const tokenRequest = await did.createJWS({ request: authRequest });
    const authToken = await fetch(`http://localhost:3000/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokenRequest: tokenRequest }),
    }).then((t) => t.text());
    setAuthToken(authToken);
  };

  const renderAuth = () => {
    if (did.status === Status.CONNECTED && !authToken) {
      return (
        <>
          <button onClick={() => requestAuth(did)}>Authenticate</button>;
        </>
      );
    }
  };

  const doLs = async () => {
    const ls = await fetch(`http://localhost:3000/ls`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }).then((t) => t.text());
    console.log("ls", ls);
  };

  const renderLs = () => {
    if (authToken) {
      return (
        <div>
          <button onClick={doLs}>ls</button>
        </div>
      );
    }
  };

  return (
    <>
      <div>{renderConnectButton()}</div>
      <div>{renderAuth()}</div>
      <div>{renderLs()}</div>
    </>
  );
}
