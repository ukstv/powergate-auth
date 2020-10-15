import { Controller, Get, Headers, Post } from "@nestjs/common";
import { AppService } from "../ancillary/app.service";
import { PowergateService } from "../ancillary/powergate.service";

@Controller("/filecoin")
export class FilecoinController {
  constructor(
    private readonly appService: AppService,
    private readonly powergate: PowergateService
  ) {}

  @Get("/address")
  async address(@Headers("Authorization") authorization: string) {
    const token = authorization.split(" ")[1];
    const [powergateToken] = await this.appService.validateBearerToken(token);
    const pow = await this.powergate.pow(powergateToken);
    return this.powergate.address(pow);
  }

  @Post("/link")
  async link(@Headers("Authorization") authorization: string) {
    const token = authorization.split(" ")[1];
    const [powergateToken, did] = await this.appService.validateBearerToken(
      token
    );
    const pow = await this.powergate.pow(powergateToken);
    const account = await this.powergate.account(pow);
    return this.powergate.link(did, account);
  }
}
