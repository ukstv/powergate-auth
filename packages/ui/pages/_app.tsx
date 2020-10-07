import React from "react";
import { Global, css } from "@emotion/core";
import { DidProvider } from "../lib/use-did";
import emotionNormalize from "emotion-normalize";
import { GlobalNotification, GlobalTooltip } from "slate-react-system";

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
      <DidProvider>
        <Component {...pageProps} />
      </DidProvider>
    </>
  );
}

export default MyApp;
