import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly token: string;
}
