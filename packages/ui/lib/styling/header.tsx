import React, { useCallback, useContext, useState } from "react";
import styled from "@emotion/styled";
import { HolyGrailLayout } from "./holy-grail-layout";
import { AuthenticationEntry } from "../authentication-entry";
import * as Ethereum from "../ethereum";
import { useObservable } from "../use-observable";

const Element = styled(HolyGrailLayout.Main)`
  padding: 1em;
  height: 3em;
`;

const Right = styled.div`
  text-align right;
`;

export function AuthEthereum() {
  const state = useObservable(
    Ethereum.dispatch.state$,
    Ethereum.dispatch.state
  );
  const [progress, setProgress] = useState(false);

  const connect = useCallback(() => {
    setProgress(true);
    Ethereum.dispatch
      .connect()
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setProgress(false);
      });
  }, [Ethereum.dispatch]);

  if (state.status === Ethereum.Status.CONNECTED) {
    return <p>Connected</p>;
  } else {
    if (progress) {
      return <p>connecting</p>;
    } else {
      return <button onClick={connect}>Connect</button>;
    }
  }
}

export function Header(props: React.PropsWithChildren<{}>) {
  return (
    <Element>
      <HolyGrailLayout.Main>...</HolyGrailLayout.Main>
      {/*<Right><AuthenticationEntry /></Right>*/}
      <Right>
        <AuthEthereum />
      </Right>
    </Element>
  );
}
