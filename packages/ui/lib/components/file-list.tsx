import React, { useEffect, useState } from "react";
import * as Backend from "../backend-connection";
import { useSubject } from "../plumbing/use-subject";
import styled from "@emotion/styled";
import * as System from "slate-react-system";
import { RefreshIcon } from "../styling/refresh-icon";

function EntryStatus(props: {
  cid: string;
  endpoint: string;
  authToken: string;
}) {
  const [status, setStatus] = useState(null);

  const refresh = () => {
    fetch(`${props.endpoint}/files/${props.cid}`, {
      headers: { Authorization: `Bearer ${props.authToken}` },
    })
      .then((r) => r.json())
      .then((json) => {
        const status = json.status;
        if (status === "SUCCESS") {
          setStatus("Pinned");
        } else if (status === "PROGRESS") {
          setStatus("Processing");
        } else {
          setStatus("Error");
        }
      });
  };

  const renderStatus = () => {
    if (status) {
      return <span>{status}</span>;
    }
  };

  return (
    <span>
      {renderStatus()} <RefreshIcon onClick={refresh} />
    </span>
  );
}

const Container = styled.div`
  margin-top: 2rem;
`;

function FileListLoad(props: { authToken: string; endpoint: string }) {
  const [list, setList] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch(`${props.endpoint}/files/`, {
      headers: { Authorization: `Bearer ${props.authToken}` },
    })
      .then((r) => r.json())
      .then((json) => {
        setList(json.list);
      });
  }, [props.authToken, props.endpoint, refresh]);

  const doRefresh = () => {
    setRefresh(refresh + 1);
  };

  const renderEntriesTable = () => {
    let tableConfiguration = {
      columns: [
        { key: "cid", name: "CID" },
        { key: "status", name: "Status" },
      ],
      rows: [],
    };
    if (list) {
      list.forEach((cid) => {
        tableConfiguration.rows.push({
          cid: cid,
          status: (
            <EntryStatus
              cid={cid}
              endpoint={props.endpoint}
              authToken={props.authToken}
            />
          ),
        });
      });
    }
    return <System.Table data={tableConfiguration}></System.Table>;
  };

  return (
    <Container>
      <System.H1>
        Stored files <RefreshIcon onClick={doRefresh} />
      </System.H1>
      {renderEntriesTable()}
    </Container>
  );
}

export function FileList() {
  const backend = Backend.useBackend();
  const backendState = useSubject(backend);

  if (backendState.status == Backend.Status.CONNECTED) {
    return (
      <FileListLoad
        authToken={backendState.authToken}
        endpoint={backendState.endpoint}
      />
    );
  } else {
    return <></>;
  }
}
