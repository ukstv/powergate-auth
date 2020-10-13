import * as Backend from "../backend-connection";
import { useSubject } from "../plumbing/use-subject";
import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

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
  });

  useEffect(() => {
    if (backendState.status === Backend.Status.CONNECTED) {
      const endpoint = `${backendState.endpoint}/filecoin/address`;
      fetch(endpoint, {
        headers: { Authorization: `Bearer ${backendState.authToken}` },
      })
        .then((r) => r.json())
        .then((address) => {
          setState({ loading: false, error: null, address: address });
        })
        .catch((error) => {
          console.log(error);
          setState({ loading: false, error: error, address: null });
        });
    }
  }, [backendState]);

  if (state.address) {
    return (
      <Element>
        {state.address.type}:{state.address.addr}
      </Element>
    );
  } else {
    return <Element></Element>;
  }
}
