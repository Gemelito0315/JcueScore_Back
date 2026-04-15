import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';

export class CreateEquipamientoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    venueId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    gameTypeId: number;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    resourceId?: number;

    @ApiProperty({ example: 'Taco profesional' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'TAC-001', required: false })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty({ example: 50, required: false })
    @IsInt()
    @IsOptional()
    stock?: number;

    @ApiProperty({ example: 10, required: false })
    @IsInt()
    @IsOptional()
    minStock?: number;

    @ApiProperty({ example: 'available', enum: ['available', 'in-use', 'damaged', 'maintenance'], required: false })
    @IsEnum(['available', 'in-use', 'damaged', 'maintenance'])
    @IsOptional()
    status?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateEquipamientoDto extends PartialType(CreateEquipamientoDto) {}
