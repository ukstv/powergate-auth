import * as Backend from "../backend-connection";
import { useSubject } from "../plumbing/use-subject";
import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { FilecoinLinkButton } from "./filecoin-link-button";

const Element = styled.div`
  height: 2.5rem;
  line-height: 2.5rem;
  margin-right: 1rem;
`;

export function FilecoinAddress() {
  const backend = Backend.useBackend();
  const backendState = useSubject(backend);
  const [state, setState] = useState({
    loading: true,
    error: null,
    address: null,
    authToken: null,
  });

  useEffect(() => {
    if (backendState.status === Backend.Status.CONNECTED) {
      const endpoint = `${backendState.endpoint}/filecoin/address`;
      fetch(endpoint, {
        headers: { Authorization: `Bearer ${backendState.authToken}` },
      })
        .then((r) => r.json())
        .then((address) => {
          setState({
            loading: false,
            error: null,
            address: address,
            authToken: backendState.authToken,
          });
        })
        .catch((error) => {
          console.log(error);
          setState({
            loading: false,
            error: error,
            address: null,
            authToken: backendState.authToken,
          });
        });
    }
  }, [backendState]);

  if (state.address && backendState.status == Backend.Status.CONNECTED) {
    return (
      <Element>
        {state.address.type}:{state.address.addr}
        <FilecoinLinkButton
          endpoint={backendState.endpoint}
          authToken={state.authToken}
          ceramic={backendState.ceramic}
          did={backendState.did.id}
          idx={backendState.idx}
        />
      </Element>
    );
  } else {
    return <Element></Element>;
  }
}
