import React, { useContext } from "react";
import styled from "@emotion/styled";
import { HolyGrailLayout } from "./holy-grail-layout";
import { CeramicConnectButton } from "../ceramic-connect-button";
import * as Ethereum from "../ethereum-connection";
import { UnreachableCaseError } from "../unreachable-case-error";
import * as System from "slate-react-system";
import { EthereumContext, useEthereum } from "../ethereum-connection";
import { useSubject } from "../plumbing/use-subject";

const Element = styled(HolyGrailLayout.Main)`
  padding: 1em;
  height: 3em;
`;

const Right = styled.div`
  text-align right;
`;

export function ConnectEthereumButton() {
  const ethereum = useEthereum()
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

export function Header(props: React.PropsWithChildren<{}>) {
  return (
    <Element>
      <HolyGrailLayout.Main>...</HolyGrailLayout.Main>
      <Right>
        <ConnectEthereumButton />
        <CeramicConnectButton />
      </Right>
    </Element>
  );
}
