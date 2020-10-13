import { SymCryptService } from "./sym-crypt.service";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

test("encrypt-decrypt", async () => {
  const symCrypt = new SymCryptService();
  const text = "Hello, World!";
  const envelope = await symCrypt.encrypt(textEncoder.encode(text));
  const decrypted = await symCrypt.decrypt(envelope);
  const decryptedText = textDecoder.decode(decrypted);
  expect(decryptedText).toEqual(text);
});

test("pack-unpack", async () => {
  const symCrypt = new SymCryptService();
  const text = "Hello, World!";
  const envelope = await symCrypt.encrypt(textEncoder.encode(text));
  const packed = symCrypt.pack(envelope);
  const unpacked = symCrypt.unpack(packed)
  const decrypted = await symCrypt.decrypt(unpacked)
  const decryptedText = textDecoder.decode(decrypted);
  expect(decryptedText).toEqual(text);
});
