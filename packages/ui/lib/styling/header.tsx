import React, { useCallback, useContext, useState } from "react";
import styled from "@emotion/styled";
import { HolyGrailLayout } from "./holy-grail-layout";
import { CeramicConnectButton } from "../ceramic-connect-button";
import * as Ethereum from "../ethereum-connection";
import { UnreachableCaseError } from "../unreachable-case-error";
import * as System from "slate-react-system";
import { useSubject } from "../plumbing/use-subject";

const Element = styled(HolyGrailLayout.Main)`
  padding: 1em;
  height: 3em;
`;

const Right = styled.div`
  text-align right;
`;

export function ConnectEthereumButton() {
  const ethereum = useSubject(Ethereum.state$);

  const connect = () => {
    Ethereum.connect$().subscribe({
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

  switch (ethereum.status) {
    case Ethereum.Status.CONNECTED:
      return <p>{ethereum.account}</p>;
    case Ethereum.Status.PROGRESS:
      return <System.LoaderCircles />;
    case Ethereum.Status.DISCONNECTED:
      return (
        <System.ButtonPrimary onClick={connect}>Connect</System.ButtonPrimary>
      );
    default:
      throw new UnreachableCaseError(ethereum);
  }
}

export function Header(props: React.PropsWithChildren<{}>) {
  return (
    <Element>
      <HolyGrailLayout.Main>...</HolyGrailLayout.Main>
      <Right>
        {/*<ConnectEthereumButton />*/}
        <CeramicConnectButton />
      </Right>
    </Element>
  );
}
