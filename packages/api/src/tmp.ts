import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import * as schema from "@filecoin-shipyard/lotus-client-schema";
import * as zondax from "@zondax/filecoin-signing-tools";
import * as uint8arrays from "uint8arrays";

const TODO_LOTUS_HOST = "ws://localhost:7777/0/node/v0";

async function main() {
  const provider = new NodejsProvider(TODO_LOTUS_HOST);
  const lotus = new LotusRPC(provider, { schema: schema.testnet.fullNode });
  const list = await lotus.walletList();
  const address = list.find((a) => a.startsWith("t3"));
  console.log("list", list);
  console.log("selected address", address);
  const message = {
    To: address,
    From: address,
    Value: "0",
    Method: 0,
    GasPrice: "1",
    GasLimit: 1000,
    GasFeeCap: "1",
    GasPremium: "1",
    Nonce: 0,
    Params: "Ynl0ZSBhcnJheQ==",
  };
  const lotusSignature = await lotus.walletSignMessage(address, message);
  console.log("lotusSignature", lotusSignature);
  const transaction = zondax.transactionSerialize(message);
  const signature = uint8arrays.fromString(
    lotusSignature.Signature.Data,
    "base64"
  );
  const signatureHex = uint8arrays.toString(signature, "base16");
  const verif = await zondax.verifySignature(signatureHex, transaction);
  console.log("verif", verif);
}

main();
