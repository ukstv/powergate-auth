import { Injectable } from "@nestjs/common";
import { createPow, Pow } from "@textile/powergate-client";
import CID from "cids";
import { DatabaseService } from "./database.service";

const TODO_POW_HOST = "http://localhost:6002";

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
    console.log("powtoken", token);
    await pow.setToken(token);
    return pow;
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
      await this.db.didPut(did, token);
      return token;
    }
  }
}
