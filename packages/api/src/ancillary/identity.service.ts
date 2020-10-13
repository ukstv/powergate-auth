import { Injectable, OnModuleDestroy } from "@nestjs/common";
import IdentityWallet from "identity-wallet";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import { DID } from "dids";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { Resolver } from "did-resolver";

const CERAMIC_API = "https://ceramic.3boxlabs.com";
const ceramic = new CeramicClient(CERAMIC_API);

const getPermission = async () => [];

const TODO_SEED = "0xc001c904547b832eb114fa778305bd47";

@Injectable()
export class IdentityService implements OnModuleDestroy {
  #idw?: IdentityWallet;
  #self?: DID;
  #resolver: Resolver;

  constructor() {
    const threeIdResolver = ThreeIdResolver.getResolver(ceramic);
    this.#resolver = new Resolver(threeIdResolver);
  }

  get resolver(): Resolver {
    return this.#resolver;
  }

  async self(): Promise<DID> {
    if (this.#self) {
      return this.#self;
    } else {
      const idw = await this.identityWallet();
      this.#self = new DID({
        provider: idw.getDidProvider(),
        resolver: this.#resolver,
      });
      await this.#self.authenticate();
      return this.#self;
    }
  }

  async identityWallet(): Promise<IdentityWallet> {
    if (this.#idw) {
      return this.#idw;
    } else {
      this.#idw = await IdentityWallet.create({
        getPermission,
        ceramic: (ceramic as unknown) as any,
        seed: TODO_SEED,
      });
      await ceramic.setDIDProvider(this.#idw.getDidProvider());
      return this.#idw;
    }
  }

  async onModuleDestroy() {
    await ceramic.close();
  }
}
