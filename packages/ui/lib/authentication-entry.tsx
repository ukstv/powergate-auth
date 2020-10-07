import React, { useState } from "react";
import { useDID } from "./use-did";
import { Status, UnreachableStatusError } from "./use-did.service";
import { Jazzicon } from "@ukstv/jazzicon-react";
import styled from "@emotion/styled";
import * as System from "slate-react-system";

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
  // const backend = useBackend();
  const did = useDID();

  // if (backend.status === BackendStatus.VOID || did.status === DidStatus.VOID) {
  //   return <p>void</p>
  // } else {
  //   return <p>Oops</p>
  // }

  const [attempt, setAttempt] = useState(0);
  // const did = useDID();

  switch (did.status) {
    case Status.CONNECTED:
      return <DidIcon id={did.id} />;
    case Status.ERROR:
      System.dispatchCustomEvent({
        name: "create-notification",
        detail: {
          id: `authentication-${attempt}`,
          description: "Error while connecting",
          status: "ERROR",
          timeout: 3000,
        },
      });
      const connect = () => {
        setAttempt(attempt + 1);
        did.connect();
      };
      return (
        <System.ButtonPrimary onClick={connect}>Connect</System.ButtonPrimary>
      );
    case Status.PROGRESS:
      return <System.LoaderCircles />;
    case Status.VOID: {
      const connect = () => {
        setAttempt(attempt + 1);
        did.connect();
      };
      return (
        <System.ButtonPrimary onClick={connect}>Connect</System.ButtonPrimary>
      );
    }
    default:
      throw new UnreachableStatusError(did);
  }
}
