import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { IdentityService } from "./identity.service";
import { SymCryptService } from "./sym-crypt.service";
import { PowergateService } from "./powergate.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [IdentityService, AppService, SymCryptService, PowergateService],
})
export class AppModule {}
