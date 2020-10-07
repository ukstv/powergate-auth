import { Injectable } from "@nestjs/common";
import Level from "level-ts";
import { createPow, Pow } from "@textile/powergate-client";

const TODO_PATH = "./storage.ldb";
const TODO_POW_HOST = "http://localhost:6002";

@Injectable()
export class PowergateService {
  #database: Level;
  #pow: Pow;

  constructor() {
    this.#database = new Level(TODO_PATH);
    this.#pow = createPow({ host: TODO_POW_HOST });
  }

  async tokenByDID(did: string) {
    const isFound = await this.#database.exists(did);
    if (isFound) {
      return this.#database.get(did);
    } else {
      const { token } = await this.#pow.ffs.create();
      await this.#database.put(did, token);
      return token;
    }
  }
}
