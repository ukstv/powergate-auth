import { Module } from "@nestjs/common";
import { AncillaryModule } from "./ancillary/ancillary.module";
import { ApiModule } from "./api/api.module";

@Module({
  imports: [AncillaryModule, ApiModule],
})
export class AppModule {}
