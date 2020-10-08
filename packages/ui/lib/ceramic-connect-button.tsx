import React from "react";
import { Jazzicon } from "@ukstv/jazzicon-react";
import styled from "@emotion/styled";
import * as System from "slate-react-system";
import * as CeramicConnection from "./ceramic-connection";
import { useSubject } from "./plumbing/use-subject";
import { UnreachableCaseError } from "./unreachable-case-error";

const LocalJazz = styled(Jazzicon)`
  width: 2.5rem;
  height: 2.5rem;
`;

function DidIcon(props: { id: string }) {
  return (
    <div title={props.id}>
      <LocalJazz address={props.id} />
    </div>
  );
}

export function CeramicConnectButton() {
  const ceramic = useSubject(CeramicConnection.state$);

  const connect = () => {
    CeramicConnection.connect$().subscribe({
      error: (error) => {
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

  switch (ceramic.status) {
    case CeramicConnection.Status.DISCONNECTED:
      return (
        <System.ButtonPrimary onClick={connect}>Connect</System.ButtonPrimary>
      );
    case CeramicConnection.Status.PROGRESS:
      return <System.LoaderCircles />;
    case CeramicConnection.Status.CONNECTED:
      return <p>{ceramic.did.id}</p>;
    default:
      throw new UnreachableCaseError(ceramic);
  }
}
