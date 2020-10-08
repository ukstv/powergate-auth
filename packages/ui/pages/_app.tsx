import React from "react";
import { Global, css } from "@emotion/core";
import { DidProvider } from "../lib/use-did";
import emotionNormalize from "emotion-normalize";
import { GlobalNotification, GlobalTooltip } from "slate-react-system";
import { UseBackendProvider } from "../lib/use-backend";
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
      <CeramicProvider endpoint={"https://ceramic.3boxlabs.com"}>
        <BackendProvider endpoint={"http://localhost:3000"}>
          <DidProvider>
            <UseBackendProvider endpoint={TODO_BACKEND_ENDPOINT}>
              <Component {...pageProps} />
            </UseBackendProvider>
          </DidProvider>
        </BackendProvider>
      </CeramicProvider>
    </>
  );
}

export default MyApp;
