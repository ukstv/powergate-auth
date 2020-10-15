import React from "react";
import { Global, css } from "@emotion/core";
import emotionNormalize from "emotion-normalize";
import { GlobalNotification, GlobalTooltip } from "slate-react-system";
import { CeramicProvider } from "../lib/ceramic-connection";
import { BackendProvider } from "../lib/backend-connection";

const TODO_BACKEND_ENDPOINT = "http://localhost:3000";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Global
        styles={css`
          ${emotionNormalize}
        `}
      />
      <GlobalTooltip />
      <GlobalNotification style={{ bottom: 0, right: 0 }} />
      <CeramicProvider endpoint={"http://localhost:7007"}>
        <BackendProvider endpoint={"http://localhost:3000"}>
          <Component {...pageProps} />
        </BackendProvider>
      </CeramicProvider>
    </>
  );
}

export default MyApp;
