import { Injectable } from "@nestjs/common";
import Level from "level-ts";

const TODO_PATH = "./storage.ldb";

@Injectable()
export class DatabaseService {
  #database: Level;

  constructor() {
    this.#database = new Level(TODO_PATH);
  }

  async didExists(did: string) {
    return this.#database.exists(did);
  }

  async didGet(did: string) {
    return this.#database.get(did);
  }

  async didPut(did: string, token: string) {
    await this.#database.put(did, token);
  }

  async getCidJobId(cid: string) {
    const key = `j:${cid}`;
    if (await this.#database.exists(key)) {
      return this.#database.get(key);
    } else {
      return null;
    }
  }

  async putCidJobId(cid: string, jobId: string) {
    await this.#database.put(`j:${cid}`, jobId);
  }
}
