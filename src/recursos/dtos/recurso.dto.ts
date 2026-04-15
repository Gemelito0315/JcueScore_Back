import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsNumber, IsEnum, IsObject } from 'class-validator';

export class CreateRecursoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    venueId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    gameTypeId: number;

    @ApiProperty({ example: 'Mesa 1' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'available', enum: ['available', 'occupied', 'maintenance', 'reserved'] })
    @IsEnum(['available', 'occupied', 'maintenance', 'reserved'])
    @IsOptional()
    status?: string;

    @ApiProperty({ example: 15000 })
    @IsNumber()
    @IsNotEmpty()
    pricePerHour: number;

    @ApiProperty({ example: { size: 'grande', type: 'profesional' }, required: false })
    @IsObject()
    @IsOptional()
    specifications?: any;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateRecursoDto extends PartialType(CreateRecursoDto) {}
