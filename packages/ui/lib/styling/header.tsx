import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { HolyGrailLayout } from "./holy-grail-layout";
import * as Ethereum from "../ethereum-connection";
import { UnreachableCaseError } from "../unreachable-case-error";
import * as System from "slate-react-system";
import { useEthereum } from "../ethereum-connection";
import { useSubject } from "../plumbing/use-subject";
import * as Backend from "../backend-connection";
import { Jazzicon } from "@ukstv/jazzicon-react";
import {FilecoinAddress} from "./filecoin-address";

const Element = styled(HolyGrailLayout.Main)`
  padding: 1em;
  height: 3em;
`;

const Right = styled.div`
  text-align right;
  display: flex;
  flex-direction: row;
`;

export function ConnectEthereumButton() {
  const ethereum = useEthereum();
  const state = useSubject(ethereum);

  const connect = () => {
    ethereum.connect$().subscribe({
      error: (error) => {
        System.dispatchCustomEvent({
          name: "create-notification",
          detail: {
            id: "connect-ethereum-button" + Math.random() * 10000,
            description: error.message,
            timeout: 3000,
            status: "ERROR",
          },
        });
      },
    });
  };

  switch (state.status) {
    case Ethereum.Status.CONNECTED:
      return <p>{state.account}</p>;
    case Ethereum.Status.PROGRESS:
      return <System.LoaderCircles />;
    case Ethereum.Status.DISCONNECTED:
      return (
        <System.ButtonPrimary onClick={connect}>Connect</System.ButtonPrimary>
      );
    default:
      throw new UnreachableCaseError(state);
  }
}

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

export function ConnectBackendButton() {
  const backend = Backend.useBackend();
  const state = useSubject(backend);

  const connect = () => {
    backend.connect$().subscribe({
      error: (error) => {
        console.error(error)
        System.dispatchCustomEvent({
          name: "create-notification",
          detail: {
            id: "connect-ethereum-button" + Math.random() * 10000,
            description: error.message,
            timeout: 3000,
            status: "ERROR",
          },
        });
      },
    });
  };

  switch (state.status) {
    case Backend.Status.CONNECTED:
      console.log(`connected as ${state.did.id}`)
      return <DidIcon id={state.did.id} />;
    case Backend.Status.PROGRESS:
      return <System.LoaderCircles />;
    case Backend.Status.DISCONNECTED:
      return (
        <System.ButtonPrimary onClick={connect}>Connect</System.ButtonPrimary>
      );
    default:
      throw new UnreachableCaseError(state);
  }
}

export function Header(props: React.PropsWithChildren<{}>) {
  return (
    <Element>
      <HolyGrailLayout.Main>...</HolyGrailLayout.Main>
      <Right>
        <FilecoinAddress />
        <ConnectBackendButton />
      </Right>
    </Element>
  );
}
