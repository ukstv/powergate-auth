import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AppService } from "./app.service";
import { IdentityService } from "./identity.service";
import { SymCryptService } from "./sym-crypt.service";
import { PowergateService } from "./powergate.service";
import { FilesController } from "./files.controller";
import { DatabaseService } from "./database.service";

@Module({
  imports: [],
  controllers: [AuthController, FilesController],
  providers: [
    IdentityService,
    AppService,
    SymCryptService,
    PowergateService,
    DatabaseService,
  ],
})
export class AppModule {}
