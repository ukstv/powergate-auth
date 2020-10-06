import React, { useState } from "react";
import { useWallet } from "use-wallet";
import { EthereumAuthProvider } from "../lib/ethereum-auth-provider";
import { useDID } from "../lib/use-did";

export function App() {
  const wallet = useWallet();
  const ethereum = wallet.ethereum as any;
  if (ethereum && wallet.account) {
  }
  return <div>App</div>;
}

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => ++value); // update the state to force render
}

export default function Home() {
  const did = useDID();
  return <div>
    <button onClick={() => did.connect()}>Connect</button>
  </div>;
  // const update = useForceUpdate()
  // const wallet = useWallet();
  //
  // const connect = async () => {
  //   const a = await wallet.connect("injected")
  //   console.log('a', a)
  //   update()
  //   console.log('injected', wallet.account)
  //   const ethereum = wallet.ethereum as any
  //   if (ethereum && wallet.account) {
  //     const provider = new EthereumAuthProvider(wallet.ethereum, wallet.account)
  //     const message = 'Add this account as a Ceramic authentication method'
  //     provider.authenticate(message).then(auth => {
  //       console.log('au', auth)
  //     })
  //   }
  // };
  //
  // return (
  //   <div>
  //     <button onClick={connect}>Connect</button>
  //     <App/>
  //   </div>
  // );
}
