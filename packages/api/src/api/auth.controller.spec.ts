import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AppService } from "../ancillary/app.service";
import { IdentityService } from "../ancillary/identity.service";
import * as didJWT from "did-jwt";
import CeramicClient from "@ceramicnetwork/ceramic-http-client";
import IdentityWallet from "identity-wallet";
import { DID } from "dids";
import { SymCryptService } from "../ancillary/sym-crypt.service";
import { PowergateService } from "../ancillary/powergate.service";

const CERAMIC_API = "http://localhost:7007";
const ceramic = new CeramicClient(CERAMIC_API);

const getPermission = async () => [];

const OTHER_SEED = "0xc001c904547b832eb114fa778305bd47";

afterAll(async () => {
  await ceramic.close();
});

describe("AppController", () => {
  let appController: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AppService,
        IdentityService,
        SymCryptService,
        PowergateService,
      ],
    }).compile();

    appController = app.get<AuthController>(AuthController);
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
