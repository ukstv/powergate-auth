import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { IdentityService } from "./identity.service";
import * as didJWT from "did-jwt";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import IdentityWallet from "identity-wallet";
import { DID } from "dids";
import { SymCryptService } from "./sym-crypt.service";
import { PowergateService } from "./powergate.service";

const CERAMIC_API = "https://ceramic.3boxlabs.com";
const ceramic = new CeramicClient(CERAMIC_API);

const getPermission = async () => [];

const OTHER_SEED = "0xc001c904547b832eb114fa778305bd47";

afterAll(async () => {
  await ceramic.close();
});

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        IdentityService,
        SymCryptService,
        PowergateService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("GET auth", () => {
    it("should return auth response", async () => {
      const id =
        "did:3:bagcqceray5sqztq4qtshdue4sv6s3fwxqzjeas2vxibv6dcdzibrq4vxdhxa";
      const result = await appController.getAuthRequest(id);
      const decoded = didJWT.decodeJWT(result);
      expect(decoded.payload.id).toEqual(id);
      const expiresAt = decoded.payload.expiresAt;
      expect(expiresAt <= new Date().valueOf() + 3 * 60).toBeTruthy();
    }, 60000);
  });

  describe("POST auth", () => {
    it("should return token", async () => {
      const otherIdentityWallet = await IdentityWallet.create({
        getPermission,
        ceramic: ceramic,
        seed: OTHER_SEED,
      });
      const other = new DID({
        provider: otherIdentityWallet.getDidProvider(),
      });
      await other.authenticate();
      const authRequest = await appController.getAuthRequest(other.id);
      const tokenRequest = await other.createJWS({ request: authRequest });
      const result = await appController.postAuthRequest(tokenRequest);
      expect(typeof result === "string").toBeTruthy();
    }, 60000);
  });
});
