import { NodejsProvider } from "@filecoin-shipyard/lotus-client-provider-nodejs";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import * as schema from "@filecoin-shipyard/lotus-client-schema";

export class FilecoinRpcProvider {
  #lotus: LotusRPC;

  constructor(readonly address: string, readonly lotusEndpoint: string) {
    const provider = new NodejsProvider(lotusEndpoint);
    this.#lotus = new LotusRPC(provider, { schema: schema.testnet.fullNode });
  }

  async getAccounts() {
    return [this.address];
  }

  async sign(address: string, tx: any) {
    return this.#lotus.walletSignMessage(address, tx);
  }
}
