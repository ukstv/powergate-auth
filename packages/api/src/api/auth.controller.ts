import { Body, Controller, Get, Post, Query, Headers } from "@nestjs/common";
import { AppService } from "../ancillary/app.service";

@Controller("/auth")
export class AuthController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  getAuthRequest(@Query("id") id: string): Promise<string> {
    return this.appService.getAuth(id);
  }

  @Post("/")
  async postAuthRequest(@Body("tokenRequest") tokenRequest: string) {
    return this.appService.postAuth(tokenRequest);
  }
}
