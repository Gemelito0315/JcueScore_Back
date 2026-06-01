import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsInt,
} from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @ApiProperty({ example: 'CC' })
  @IsString()
  @IsOptional()
  docType?: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsOptional()
  docNumber?: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'juan@ejemplo.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @IsOptional()
  loyaltyPoints?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
