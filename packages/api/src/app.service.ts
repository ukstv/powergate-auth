import { Injectable } from "@nestjs/common";
import { IdentityService } from "./identity.service";
import * as didJwt from "did-jwt";
import { SymCryptService } from "./sym-crypt.service";
import { PowergateService } from "./powergate.service";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

@Injectable()
export class AppService {
  constructor(
    private readonly identityService: IdentityService,
    private readonly symCrypt: SymCryptService,
    private readonly powergateService: PowergateService
  ) {}

  async getAuth(id: string): Promise<string> {
    const self = await this.identityService.self();
    const now = Math.floor(new Date().valueOf() / 1000);
    const expiresAt = now + 3 * 60; // + 3 minutes
    return self.createJWS({ id: id, expiresAt: expiresAt });
  }

  async postAuth(tokenRequest: string): Promise<string> {
    const self = await this.identityService.self();
    const id = await this.validateAuthRequest(tokenRequest);
    const powergateToken = await this.powergateService.tokenByDID(id);
    const s = await this.symCrypt.encryptPacked(
      textEncoder.encode(powergateToken)
    );
    const now = Math.floor(new Date().valueOf() / 1000);
    const expiresAt = now + 3 * 60 * 60; // + 3 hours
    return self.createJWS({ token: s, expiresAt: expiresAt });
  }

  async validateBearerToken(bearerToken: string) {
    const self = await this.identityService.self();
    const decoded = didJwt.decodeJWT(bearerToken);
    const token = decoded.payload.token;
    if (decoded.payload.expiresAt <= Math.floor(new Date().valueOf() / 1000)) {
      throw new Error(`Expired token`);
    }
    const isIssuedBySelf =
      decoded.header.kid && decoded.header.kid.startsWith(self.id);
    if (!isIssuedBySelf) {
      throw new Error("Not issued by me");
    }
    const isSignedBySelf = await this.validateSignature(bearerToken, self.id);
    if (!isSignedBySelf) {
      throw new Error(`Not signed by me`);
    }
    const powergateToken = await this.symCrypt.decryptPacked(token);
    return textDecoder.decode(powergateToken);
  }

  async validateAuthRequest(tokenRequest: string): Promise<string> {
    const decoded = didJwt.decodeJWT(tokenRequest);
    const request = didJwt.decodeJWT(decoded.payload.request);
    const self = await this.identityService.self();
    const isIssuedBySelf =
      request.header.kid && request.header.kid.startsWith(self.id);
    if (!isIssuedBySelf) {
      throw new Error("Not signed by me");
    }
    const now = new Date().valueOf();
    const expiresAt = request.payload.expiresAt * 1000;
    const isLive = now <= expiresAt;
    if (!isLive) {
      throw new Error(`Expired`);
    }
    const isSignedBySelf = await this.validateSignature(
      decoded.payload.request,
      self.id
    );
    if (!isSignedBySelf) {
      throw new Error(`Not signed by me`);
    }
    const isSignedByOther = await this.validateSignature(
      tokenRequest,
      request.payload.id
    );
    if (!isSignedByOther) {
      throw new Error(`Not signed by requesting subject`);
    }
    return request.payload.id as string;
  }

  async validateSignature(jws: string, id: string): Promise<boolean> {
    try {
      const { publicKey } = await this.identityService.resolver.resolve(id);
      await didJwt.verifyJWS(jws, publicKey);
      return true;
    } catch {
      return false;
    }
  }
}
