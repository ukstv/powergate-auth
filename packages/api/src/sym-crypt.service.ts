import * as crypto from "crypto";
import { Injectable } from "@nestjs/common";
import * as bytes from "uint8arrays";
import * as borc from "borc";

const TODO_SECRET = "c001c904547b832eb114fa778305bd47";
const algorithm = "aes-256-ctr";

export interface Envelope {
  iv: Uint8Array;
  content: Uint8Array;
}

@Injectable()
export class SymCryptService {
  constructor() {}

  async encrypt(plainText: Uint8Array): Promise<Envelope> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, TODO_SECRET, iv);
    const encrypted = bytes.concat([cipher.update(plainText), cipher.final()]);
    return {
      iv: iv,
      content: encrypted,
    };
  }

  async encryptPacked(plainText: Uint8Array): Promise<string> {
    const envelope = await this.encrypt(plainText);
    return this.pack(envelope);
  }

  async decryptPacked(input: string): Promise<Uint8Array> {
    const envelope = this.unpack(input);
    return this.decrypt(envelope);
  }

  async decrypt(envelope: Envelope): Promise<Uint8Array> {
    const decipher = crypto.createDecipheriv(
      algorithm,
      TODO_SECRET,
      envelope.iv
    );
    return bytes.concat([decipher.update(envelope.content), decipher.final()]);
  }

  pack(envelope: Envelope): string {
    const raw = borc.encode(envelope);
    return bytes.toString(raw, "base64url");
  }

  unpack(input: string): Envelope {
    const raw = bytes.fromString(input, "base64url");
    return borc.decode(raw);
  }
}
