import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Headers,
  UseInterceptors,
  UploadedFile,
  Param,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { PowergateService } from "./powergate.service";

@Controller("/files")
export class FilesController {
  constructor(
    private readonly appService: AppService,
    private readonly powergate: PowergateService
  ) {}

  @Post("/upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file,
    @Headers("Authorization") authorization: string
  ) {
    const token = authorization.split(" ")[1];
    const powergateToken = await this.appService.validateBearerToken(token);
    const pow = await this.powergate.pow(powergateToken);
    const cid = await this.powergate.upload(pow, file.buffer);
    console.log("file", file, cid);
  }

  @Get("/")
  async list(@Headers("Authorization") authorization: string) {
    const token = authorization.split(" ")[1];
    const powergateToken = await this.appService.validateBearerToken(token);
    const pow = await this.powergate.pow(powergateToken);
    const list = await this.powergate.list(pow);
    return {
      list: list,
    };
  }

  @Get("/:cid")
  async status(
    @Param("cid") cid: string,
    @Headers("Authorization") authorization: string
  ) {
    const token = authorization.split(" ")[1];
    const powergateToken = await this.appService.validateBearerToken(token);
    const pow = await this.powergate.pow(powergateToken);
    const status = await this.powergate.status(pow, cid);
    return {
      cid: cid,
      status: status,
    };
  }
}
