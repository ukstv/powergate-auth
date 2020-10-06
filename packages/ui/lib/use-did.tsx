import React, { useContext } from "react";
import { useWallet, UseWalletProvider } from "use-wallet";

type DidContext = {
  connect(): void;
  did: string | null;
};

const DidContext = React.createContext<DidContext | null>(null);

export function useDID(): DidContext {
  const didContext = useContext(DidContext);
  if (didContext) {
    return didContext;
  } else {
    throw new Error(
      "useDID() can only be used inside of <DidProvider />, please declare it at a higher level."
    );
  }
}

function DidProviderWrap(props: React.PropsWithChildren<{}>) {
  const wallet = useWallet();
  const didContext = useContext(DidContext);

  let context: DidContext;

  if (wallet.account && wallet.ethereum) {
    if (didContext && didContext.did) {
      // Authenticated
      context = didContext;
    } else {
      // Require authentication
      const message = 'Add this account as a Ceramic authentication method'

      context = {
        connect: () => {
          // Do Nothing. Already connected
        },
        did: null,
      };
    }
  } else {
    context = {
      did: null,
      connect: () => {
        wallet
          .connect("injected")
          .then(() => {
            // Do Nothing
          })
          .catch(() => {
            // Do Nothing
          });
      },
    };
  }

  return (
    <DidContext.Provider value={context}>{props.children}</DidContext.Provider>
  );
}

export function DidProvider(props: React.PropsWithChildren<{}>) {
  return (
    <UseWalletProvider chainId={1}>
      <DidProviderWrap>{props.children}</DidProviderWrap>
    </UseWalletProvider>
  );
}
