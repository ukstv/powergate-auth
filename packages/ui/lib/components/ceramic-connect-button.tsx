import React from "react";
import { Jazzicon } from "@ukstv/jazzicon-react";
import styled from "@emotion/styled";
import * as System from "slate-react-system";
import * as CeramicConnection from "../ceramic-connection";
import { UnreachableCaseError } from "../3id-replacement/unreachable-case-error";
import { useCeramic } from "../ceramic-connection";
import { useSubject } from "../plumbing/use-subject";

export function CeramicConnectButton() {
  const ceramic = useCeramic();
  const state = useSubject(ceramic);

  const connect = () => {
    ceramic.connect$().subscribe({
      error: (error) => {
        console.error(error)
        System.dispatchCustomEvent({
          name: "create-notification",
          detail: {
            id: "ceramic-connect-button" + Math.random() * 10000,
            description: error.message,
            timeout: 3000,
            status: "ERROR",
          },
        });
      },
    });
  };

  switch (state.status) {
    case CeramicConnection.Status.DISCONNECTED:
      return (
        <System.ButtonPrimary onClick={connect}>Connect</System.ButtonPrimary>
      );
    case CeramicConnection.Status.PROGRESS:
      return <System.LoaderCircles />;
    case CeramicConnection.Status.CONNECTED:
      return <p>{state.did.id}</p>;
    default:
      throw new UnreachableCaseError(state);
  }
}
