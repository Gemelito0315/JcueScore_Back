import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateCategoriaDto {
    @ApiProperty({ example: 'Bebidas' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Bebidas en general', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}

export class CreateSubcategoriaDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    categoryId: number;

    @ApiProperty({ example: 'Alcohólicas' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Bebidas con alcohol', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
export class UpdateSubcategoriaDto extends PartialType(CreateSubcategoriaDto) {}

export class CreateTipoProductoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    subcategoryId: number;

    @ApiProperty({ example: 'Cervezas' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Cervezas nacionales e importadas', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
export class UpdateTipoProductoDto extends PartialType(CreateTipoProductoDto) {}
