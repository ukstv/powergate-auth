import React, { useEffect, useState } from "react";
import { CeramicApi } from "@ceramicnetwork/ceramic-common";
import { IDX } from "@ceramicstudio/idx";
import * as idxTools from "@ceramicstudio/idx-tools";
import { BiBadge, BiAngry, BiBadgeCheck } from "react-icons/bi";
import styled from "@emotion/styled";

type Props = {
  endpoint: string;
  authToken: string;
  did: string;
  ceramic: CeramicApi;
  idx: IDX;
};

const BadgeIcon = styled(BiBadge)`
  vertical-align: middle;
`;

const AngryIcon = styled(BiAngry)`
  vertical-align: middle;
`;

const BadgeDoneIcon = styled(BiBadgeCheck)`
  vertical-align: middle;
`;

export function FilecoinLinkButton(props: Props) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    done: false,
  });

  useEffect(() => {
    linkAccount()
      .then(() => {
        setState({ loading: false, error: null, done: true });
      })
      .catch((error) => {
        console.error(error);
        setState({ loading: false, error: String(error), done: false });
      });
  }, [props]);

  const linkAccount = async () => {
    const linkProof = await fetch(`${props.endpoint}/filecoin/link`, {
      method: "POST",
      headers: { Authorization: `Bearer ${props.authToken}` },
    }).then((r) => r.json());
    const ceramic = props.ceramic;
    const idx = props.idx;
    const { definitions } = await idxTools.publishIDXConfig(ceramic);
    const existingLinks = await idx.get("cryptoAccountLinks");
    if (existingLinks && existingLinks[linkProof.account]) {
      return;
    } else {
      const accountLinkDocument = await ceramic.createDocument(
        "account-link",
        { metadata: { owners: [linkProof.account] } },
        { applyOnly: true }
      );
      await accountLinkDocument.change({ content: linkProof });

      await idx.set(definitions.cryptoAccountLinks, {
        [linkProof.account]: accountLinkDocument.id,
      });
    }
  };

  if (state.loading) {
    return <BadgeIcon />;
  }
  if (state.error) {
    return <AngryIcon />;
  }
  if (state.done) {
    return <BadgeDoneIcon />;
  }
}
