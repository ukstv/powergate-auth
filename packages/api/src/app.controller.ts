import { Body, Controller, Get, Post, Query, Headers } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/auth")
  getAuthRequest(@Query("id") id: string): Promise<string> {
    return this.appService.getAuth(id);
  }

  @Post("/auth")
  async postAuthRequest(@Body("tokenRequest") tokenRequest: string) {
    const token = await this.appService.postAuth(tokenRequest);
    console.log("token", token);
    return token
  }

  @Get("/ls")
  async getLs(@Headers("Authorization") authorization: string) {
    const token = authorization.split(' ')[1]
    await this.appService.validateBearerToken(token)
    console.log('ls token', token)
    return 'ss'
  }
}
