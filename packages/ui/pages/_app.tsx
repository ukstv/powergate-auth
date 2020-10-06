import React from "react";
import "../styles/globals.css";
import { DidProvider } from "../lib/use-did";

function MyApp({ Component, pageProps }) {
  return (
    <DidProvider>
      <Component {...pageProps} />
    </DidProvider>
  );
}

export default MyApp;
