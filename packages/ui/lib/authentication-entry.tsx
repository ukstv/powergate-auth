import React, { useState } from "react";
import { Status, UnreachableStatusError, useDID } from "./use-did";
import {
  ButtonPrimary,
  LoaderCircles,
  dispatchCustomEvent,
} from "slate-react-system";
import { Jazzicon } from "@ukstv/jazzicon-react";
import styled from "@emotion/styled";

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

export function AuthenticationEntry() {
  const [attempt, setAttempt] = useState(0);
  const did = useDID();

  switch (did.status) {
    case Status.CONNECTED:
      return <DidIcon id={did.id} />;
    case Status.ERROR:
      dispatchCustomEvent({
        name: "create-notification",
        detail: {
          id: attempt,
          description: "Error while connecting",
          status: "ERROR",
          timeout: 3000,
        },
      });
      const connect = () => {
        setAttempt(attempt + 1);
        did.connect();
      };
      return <ButtonPrimary onClick={connect}>Connect</ButtonPrimary>;
    case Status.REQUESTING:
      return <LoaderCircles />;
    case Status.VOID: {
      const connect = () => {
        setAttempt(attempt + 1);
        did.connect();
      };
      return <ButtonPrimary onClick={connect}>Connect</ButtonPrimary>;
    }
    default:
      throw new UnreachableStatusError(did);
  }
}
