import { Injectable } from "@nestjs/common";
import { createPow, Pow } from "@textile/powergate-client";
import CID from "cids";
import { DatabaseService } from "./database.service";
import * as _ from "lodash";
import * as blockchainUtils from "@ukstv/3id-blockchain-utils";
import { FilecoinRpcProvider } from "./filecoin-rpc-provider";
import { AccountID } from "caip";
import { LinkProof } from "@ukstv/3id-blockchain-utils";

const TODO_POW_HOST = "http://localhost:6002";
const TODO_LOTUS_HOST = "ws://localhost:7777/0/node/v0";

export enum PinStatus {
  ERROR = "ERROR",
  PROGRESS = "PROGRESS",
  SUCCESS = "SUCCESS",
}

export enum JobStatusMap {
  JOB_STATUS_UNSPECIFIED = 0,
  JOB_STATUS_QUEUED = 1,
  JOB_STATUS_EXECUTING = 2,
  JOB_STATUS_FAILED = 3,
  JOB_STATUS_CANCELED = 4,
  JOB_STATUS_SUCCESS = 5,
}

@Injectable()
export class PowergateService {
  #pow: Pow;

  constructor(private readonly db: DatabaseService) {
    this.#pow = createPow({ host: TODO_POW_HOST });
  }

  async pow(token: string): Promise<Pow> {
    const pow = createPow({ host: TODO_POW_HOST });
    await pow.setToken(token);
    return pow;
  }

  async address(pow: Pow): Promise<{ addr: string; type: string }> {
    const { addrsList } = await pow.ffs.addrs();
    return addrsList.find((a) => a.name === "default");
  }

  async account(pow: Pow): Promise<AccountID> {
    const address = await this.address(pow);
    return new AccountID({
      address: address.addr,
      chainId: `fil:${address.addr[0]}`,
    });
  }

  async link(did: string, account: AccountID): Promise<LinkProof> {
    const provider = new FilecoinRpcProvider(account.address, TODO_LOTUS_HOST);
    return blockchainUtils.createLink(did, account, provider);
  }

  async upload(pow: Pow, buffer: Buffer): Promise<CID> {
    const { cid } = await pow.ffs.stage(buffer);
    const { jobId } = await pow.ffs.pushStorageConfig(cid.toString());
    await this.db.putCidJobId(cid, jobId);
    return new CID(cid);
  }

  async list(pow: Pow) {
    const { info } = await pow.ffs.info();
    return info.pinsList;
  }

  async status(pow: Pow, cid: string): Promise<PinStatus> {
    try {
      const jobId = await this.db.getCidJobId(cid);
      const { job } = await pow.ffs.getStorageJob(jobId);
      switch (job.status) {
        case JobStatusMap.JOB_STATUS_SUCCESS:
          return PinStatus.SUCCESS;
        case JobStatusMap.JOB_STATUS_CANCELED:
          return PinStatus.ERROR;
        case JobStatusMap.JOB_STATUS_FAILED:
          return PinStatus.ERROR;
        case JobStatusMap.JOB_STATUS_EXECUTING:
          return PinStatus.PROGRESS;
        case JobStatusMap.JOB_STATUS_QUEUED:
          return PinStatus.PROGRESS;
        case JobStatusMap.JOB_STATUS_UNSPECIFIED:
          return PinStatus.ERROR;
      }
    } catch (e) {
      return PinStatus.ERROR;
    }
  }

  async tokenByDID(did: string) {
    const isFound = await this.db.didExists(did);
    if (isFound) {
      return this.db.didGet(did);
    } else {
      const { token } = await this.#pow.ffs.create();
      const pow = await this.pow(token);
      await pow.ffs.newAddr("default", "secp256k1", true);
      await this.db.didPut(did, token);
      return token;
    }
  }
}
