import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AncillaryModule } from "../ancillary/ancillary.module";
import {FilesController} from "./files.controller";

@Module({
  imports: [AncillaryModule],
  controllers: [AuthController, FilesController],
})
export class ApiModule {}
