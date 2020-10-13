import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { IdentityService } from "./identity.service";
import { SymCryptService } from "./sym-crypt.service";
import { PowergateService } from "./powergate.service";
import {DatabaseService} from "./database.service";

@Module({
  providers: [AppService, IdentityService, SymCryptService, PowergateService, DatabaseService],
  exports: [AppService, IdentityService, SymCryptService, PowergateService, DatabaseService],
})
export class AncillaryModule {}
