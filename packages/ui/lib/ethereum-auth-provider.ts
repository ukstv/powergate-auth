import { createLink, authenticate } from "@ukstv/3id-blockchain-utils";
import type { LinkProof } from "@ukstv/3id-blockchain-utils";
import { AbstractAuthProvider } from "./abstract-auth-provider";
import { AccountID } from "caip";

// TODO get network from provider
const chainId = "eip155:1";

export function asAccountId(address): AccountID {
  return new AccountID({ address, chainId });
}

/**
 *  AuthProvider which can be used for ethreum providers with standard interface
 */
export class EthereumAuthProvider extends AbstractAuthProvider {
  private readonly provider: any;
  private readonly address: string;
  private readonly accountId: AccountID;

  constructor(ethProvider: any, address: string) {
    super();
    this.provider = ethProvider;
    this.address = address;
    this.accountId = new AccountID({ address, chainId });
  }

  async authenticate(message: string, address?: string): Promise<string> {
    const accountId = address ? asAccountId(address) : this.accountId;
    return authenticate(message, accountId, this.provider);
  }

  async createLink(did: string, address?: string): Promise<LinkProof> {
    const accountId = address ? asAccountId(address) : this.accountId;
    return createLink(did, accountId, this.provider, { type: "ethereum-eoa" });
  }
}
